import { type NextRequest, NextResponse } from "next/server"

// This is a mock database. In a real application, you would use a proper database.
const adminDocuments: any[] = []

export async function POST(req: NextRequest) {
  try {
    const { files, shopId, verificationCode } = await req.json()

    console.log("Received data:", { files, shopId, verificationCode })

    // In a real application, you would save this data to a database
    adminDocuments.push({
      files,
      shopId,
      verificationCode,
      timestamp: new Date(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error processing request:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}

export async function GET() {
  // Add some sample data if the array is empty (for testing purposes)
  if (adminDocuments.length === 0) {
    adminDocuments.push({
      files: [
        {
          id: 1,
          name: "Sample Document.pdf",
          color: "Color",
          copies: 2,
          description: "Test document",
          exactPages: 5,
          file: null,
        },
      ],
      shopId: "shop-1",
      verificationCode: "12345",
      timestamp: new Date(),
    })
  }

  // In a real application, you would fetch this data from a database
  return NextResponse.json({ documents: adminDocuments })
}
