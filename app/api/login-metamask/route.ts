import { type NextRequest, NextResponse } from "next/server"
import { ethers } from "ethers"

export async function POST(request: NextRequest) {
  try {
    const { metamask_address, signature } = await request.json()

    if (!metamask_address || !signature) {
      return NextResponse.json({ error: "Address and signature are required" }, { status: 400 })
    }

    // In a real application, you would:
    // 1. Retrieve the nonce from your database for this address
    // 2. Verify the signature matches the nonce
    // 3. Generate and return a JWT token

    // For demo purposes, we'll create a mock verification
    const mockNonce = `Please sign this message to authenticate with VeriCred: ${Math.random().toString(36).substring(2, 15)}`

    try {
      // Verify the signature (in production, use the actual nonce from database)
      const recoveredAddress = ethers.verifyMessage(mockNonce, signature)

      if (recoveredAddress.toLowerCase() !== metamask_address.toLowerCase()) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
      }
    } catch (verifyError) {
      // For demo purposes, we'll skip strict verification
      console.log("Signature verification skipped for demo")
    }

    // Generate a mock JWT token (in production, use a proper JWT library)
    const mockToken = `jwt_token_${metamask_address}_${Date.now()}`

    return new NextResponse(mockToken, { status: 200 })
  } catch (error) {
    console.error("Error during MetaMask login:", error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
