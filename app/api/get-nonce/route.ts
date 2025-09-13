import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { metamask_address } = await request.json()

    if (!metamask_address) {
      return NextResponse.json({ error: "MetaMask address is required" }, { status: 400 })
    }

    // Generate a random nonce for the user to sign
    const nonce = `Please sign this message to authenticate with VeriCred: ${Math.random().toString(36).substring(2, 15)}`

    // In a real application, you would store this nonce in a database
    // associated with the user's address for verification later

    return NextResponse.json({ nonce })
  } catch (error) {
    console.error("Error generating nonce:", error)
    return NextResponse.json({ error: "Failed to generate nonce" }, { status: 500 })
  }
}
