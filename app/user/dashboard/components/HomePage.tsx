"use client"

import { useState, useEffect } from "react"
import { Search, LogOut, Store, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Shop {
  id: string
  shopName: string
  shopAddress: string
}

interface HomePageProps {
  onShopSelect: (shop: Shop) => void
  onSignOut: () => void
}

export default function HomePage({ onShopSelect, onSignOut }: HomePageProps) {
  const [searchResults, setSearchResults] = useState<Shop[]>([])
  const [recentSelections, setRecentSelections] = useState<Shop[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load recent selections from localStorage on component mount
  useEffect(() => {
    const savedSelections = localStorage.getItem("recentShops")
    if (savedSelections) {
      try {
        setRecentSelections(JSON.parse(savedSelections))
      } catch (e) {
        console.error("Failed to parse recent selections", e)
      }
    }
  }, [])

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    setError(null)

    if (query.trim() === "") {
      setSearchResults([])
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/shops?search=${encodeURIComponent(query)}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch shops: ${response.status}`)
      }

      const data = await response.json()
      console.log("Search results:", data) // Debug log

      if (Array.isArray(data.shops)) {
        setSearchResults(data.shops)
      } else {
        console.error("Unexpected API response format:", data)
        setSearchResults([])
        setError("Received invalid data format from server")
      }
    } catch (error) {
      console.error("Error fetching shops:", error)
      setError("Failed to fetch shops. Please try again.")
      setSearchResults([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleShopSelect = (shop: Shop) => {
    onShopSelect(shop)

    // Update recent selections
    const updatedSelections = [shop, ...recentSelections.filter((s) => s.id !== shop.id)].slice(0, 3)

    setRecentSelections(updatedSelections)

    // Save to localStorage
    localStorage.setItem("recentShops", JSON.stringify(updatedSelections))
  }

  // Add some sample shops for testing if no shops are found
  const addSampleShops = async () => {
    try {
      const sampleShops = [
        {
          name: "Admin",
          email: "admin@test.com",
          phone: "1234567890",
          shopName: "Quick Print",
          shopAddress: "123 Main St",
        },
        {
          name: "Admin2",
          email: "admin2@test.com",
          phone: "0987654321",
          shopName: "Copy Express",
          shopAddress: "456 Oak Ave",
        },
      ]

      for (const shop of sampleShops) {
        await fetch("/api/shops", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(shop),
        })
      }

      alert("Sample shops added! Try searching for 'Quick' or 'Copy'")
    } catch (error) {
      console.error("Error adding sample shops:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 text-center">Welcome to Xerox Karao</h1>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center">
                <Store className="h-8 w-8 text-emerald-600" />
              </div>
            </div>
            <div className="flex-grow mx-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search xerox shops by name..."
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 border-gray-200 focus:border-emerald-500 focus:ring focus:ring-emerald-200 transition-all duration-300"
                />
              </div>
            </div>
            <Button
              variant="outline"
              onClick={onSignOut}
              className="border-gray-300 hover:bg-gray-100 hover:text-gray-900 transition-all duration-300"
            >
              <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </Button>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            {isLoading ? (
              <div className="px-4 py-8 text-center">
                <div className="inline-block animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full mb-2"></div>
                <p className="text-gray-500">Searching for shops...</p>
              </div>
            ) : searchQuery.trim() === "" ? (
              <div className="px-4 py-8 text-center">
                <Search className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                <p className="text-gray-500 mb-4">Enter a shop name to search</p>
                <Button variant="outline" size="sm" onClick={addSampleShops} className="text-xs">
                  Add Sample Shops (For Testing)
                </Button>
              </div>
            ) : error ? (
              <div className="px-4 py-8 text-center text-red-500">
                <p>{error}</p>
                <Button variant="outline" size="sm" onClick={() => handleSearch(searchQuery)} className="mt-2">
                  Try Again
                </Button>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-gray-500">No shops found matching "{searchQuery}"</p>
                <Button variant="outline" size="sm" onClick={addSampleShops} className="mt-2 text-xs">
                  Add Sample Shops (For Testing)
                </Button>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {searchResults.map((shop) => (
                  <li key={shop.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-medium text-emerald-600 truncate">{shop.shopName}</p>
                        <Button
                          onClick={() => handleShopSelect(shop)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white transition-all duration-300"
                        >
                          Select
                        </Button>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <p className="flex items-center text-sm text-gray-500">
                          <MapPin className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                          {shop.shopAddress}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {recentSelections.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Store className="mr-2 h-5 w-5 text-emerald-500" />
                Recent Selections
              </h2>
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <ul className="divide-y divide-gray-200">
                  {recentSelections.map((shop) => (
                    <li key={shop.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <p className="text-lg font-medium text-emerald-600 truncate">{shop.shopName}</p>
                          <Button
                            onClick={() => handleShopSelect(shop)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white transition-all duration-300"
                          >
                            Select
                          </Button>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between">
                          <p className="flex items-center text-sm text-gray-500">
                            <MapPin className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                            {shop.shopAddress}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
