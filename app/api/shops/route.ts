import { type NextRequest, NextResponse } from "next/server"

// This is a mock database. In a real application, you would use a proper database.
const shops: any[] = [
  {
    id: "shop-1",
    name: "John Doe",
    email: "john@example.com",
    phone: "1234567890",
    shopName: "Quick Print Center",
    shopAddress: "123 Main Street, City",
  },
  {
    id: "shop-2",
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "0987654321",
    shopName: "Copy Express",
    shopAddress: "456 Oak Avenue, Town",
  },
]

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, shopName, shopAddress } = await req.json()
    const newShop = {
      id: `shop-${Date.now()}`,
      name,
      email,
      phone,
      shopName,
      shopAddress,
    }
    shops.push(newShop)
    return NextResponse.json({ success: true, shop: newShop })
  } catch (error) {
    console.error("Error registering shop:", error)
    return NextResponse.json({ error: "Failed to register shop" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const searchQuery = req.nextUrl.searchParams.get("search") || ""
    console.log("Search query:", searchQuery) // Debug log

    const filteredShops = shops.filter((shop) => shop.shopName.toLowerCase().includes(searchQuery.toLowerCase()))

    console.log("Filtered shops:", filteredShops) // Debug log
    return NextResponse.json({ shops: filteredShops })
  } catch (error) {
    console.error("Error searching shops:", error)
    return NextResponse.json({ error: "Failed to search shops" }, { status: 500 })
  }
}
