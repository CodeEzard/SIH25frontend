import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

function normalize(val: any) {
  let link = typeof val === "string" ? val : val == null ? "" : String(val);
  link = link.trim();
  if (!link) return "";
  if (/^ar:\/\//i.test(link))
    return link.replace(/^ar:\/\//i, "https://arweave.net/");
  if (/^https?:\/\//i.test(link)) return link;
  link = link.replace(/^ipfs:\/\//i, "");
  link = link.replace(/^\/?ipfs\//i, "");
  link = link.replace(/^ipfs\//i, "");
  return link;
}

function buildCandidates(src: string) {
  const tryUrls: string[] = [];
  if (/^https?:\/\//i.test(src)) {
    tryUrls.push(src);
  } else {
    const parts = src.split("/").filter(Boolean);
    const cid = parts.shift() || "";
    const path = parts.length ? `/${parts.join("/")}` : "";
    const pathGateways = [
      (h: string, p: string) => `https://cloudflare-ipfs.com/ipfs/${h}${p}`,
      (h: string, p: string) => `https://ipfs.io/ipfs/${h}${p}`,
      (h: string, p: string) => `https://nftstorage.link/ipfs/${h}${p}`,
      (h: string, p: string) => `https://dweb.link/ipfs/${h}${p}`,
      (h: string, p: string) => `https://gateway.pinata.cloud/ipfs/${h}${p}`,
    ];
    const subdomainGateways = [
      (h: string, p: string) => `https://${h}.ipfs.nftstorage.link${p}`,
      (h: string, p: string) => `https://${h}.ipfs.dweb.link${p}`,
    ];
    for (const g of pathGateways) tryUrls.push(g(cid, path));
    for (const g of subdomainGateways) tryUrls.push(g(cid, path));
  }
  return tryUrls;
}

async function fetchWithTimeout(url: string, ms = 8000) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), ms);
  try {
    const r = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json,text/plain,*/*" },
      signal: controller.signal,
      cache: "no-store",
    });
    return r;
  } finally {
    clearTimeout(t);
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const raw = searchParams.get("src") || "";
  const src = normalize(raw);
  if (!src) {
    return NextResponse.json(
      { ok: false, error: "Missing or invalid src" },
      { status: 400 }
    );
  }

  const tryUrls = buildCandidates(src);

  for (const url of tryUrls) {
    try {
      const r = await fetchWithTimeout(url, 8000);
      if (!r.ok) continue;
      const ct = r.headers.get("content-type") || "";
      if (ct.includes("application/json") || ct.includes("text/json")) {
        const data = await r.json();
        return NextResponse.json({
          ok: true,
          resolvedUrl: url,
          contentType: ct,
          data,
        });
      } else {
        const text = await r.text();
        let data: any = text;
        try {
          data = JSON.parse(text);
        } catch {}
        return NextResponse.json({
          ok: true,
          resolvedUrl: url,
          contentType: ct,
          data,
        });
      }
    } catch (e) {
      // continue to next candidate
    }
  }

  return NextResponse.json(
    {
      ok: false,
      error: "All public gateways failed (timeout/CORS/content missing).",
      candidates: tryUrls,
    },
    { status: 502 }
  );
}
