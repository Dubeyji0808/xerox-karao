"use client"

import { useState, useEffect } from "react"
import { Search, LayoutDashboard, Users, FileText } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DocumentDetailsDialog } from "./document-details-dialog"
import { UserList } from "./user-list"
import { CodeVerification } from "./code-verification"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"

export type User = {
  id: string
  phone: string
  queueNumber: number
  documents: Document[]
  verificationCode?: string
}

export type Document = {
  id: string
  name: string
  type: "color" | "bw"
  amount: number
  url: string
  copies: number
  description?: string
}

export function AdminDashboard() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [verifyingUser, setVerifyingUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/send-to-admin")
      if (!response.ok) {
        throw new Error("Failed to fetch documents")
      }
      const data = await response.json()

      // Log the raw data to help with debugging
      console.log("API Response:", data)

      if (Array.isArray(data.documents)) {
        const newUsers = data.documents.map((doc, index) => ({
          id: `user-${index}`,
          phone: `User ${index + 1}`,
          queueNumber: index + 1,
          documents: Array.isArray(doc.files)
            ? doc.files.map((file, fileIndex) => ({
                id: `doc-${index}-${fileIndex}`,
                name: file.name || `Document ${fileIndex + 1}`,
                type: file.color === "Color" ? "color" : "bw",
                amount: (file.exactPages || 1) * 2 * (file.copies || 1),
                url: "#", // In a real app, you'd have a proper URL here
                copies: file.copies || 1,
                description: file.description || "",
              }))
            : [],
          verificationCode: doc.verificationCode || "12345", // Fallback code for testing
        }))
        setUsers(newUsers)
        console.log("Processed users:", newUsers)
      } else {
        console.error("Unexpected API response format:", data)
        // Add some sample data for testing if the API doesn't return expected format
        addSampleUsers()
      }
    } catch (error) {
      console.error("Error fetching documents:", error)
      // Add some sample data for testing if the API fails
      addSampleUsers()
    } finally {
      setIsLoading(false)
    }
  }

  const addSampleUsers = () => {
    const sampleUsers = [
      {
        id: "user-sample-1",
        phone: "Sample User 1",
        queueNumber: 1,
        documents: [
          {
            id: "doc-sample-1",
            name: "Sample Document.pdf",
            type: "color",
            amount: 20,
            url: "#",
            copies: 2,
            description: "Test document",
          },
        ],
        verificationCode: "12345",
      },
    ]
    setUsers(sampleUsers)
  }

  const handleUserComplete = async (userId: string) => {
    const userToVerify = users.find((user) => user.id === userId)
    if (userToVerify) {
      console.log("User to verify:", userToVerify)
      setVerifyingUser(userToVerify)
    }
  }

  const handleUserReject = async (userId: string) => {
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call

    setUsers((prevUsers) => {
      const updatedUsers = prevUsers.filter((user) => user.id !== userId)
      return updatedUsers.map((user, index) => ({
        ...user,
        queueNumber: index + 1,
      }))
    })

    toast({
      title: "User rejected",
      description: "The user has been notified that their request was rejected.",
    })
  }

  const handleVerifyCode = async (code: string) => {
    if (!verifyingUser) {
      toast({
        title: "Error",
        description: "No user selected for verification",
        variant: "destructive",
      })
      return
    }

    console.log(`Verifying code: ${code} against ${verifyingUser.verificationCode}`)

    if (verifyingUser.verificationCode === code) {
      toast({
        title: "Success!",
        description: "Code verified successfully!",
        variant: "default",
      })

      // Remove the verified user from the list
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== verifyingUser.id))
      setVerifyingUser(null)
    } else {
      toast({
        title: "Invalid code",
        description: `The code doesn't match. Expected: ${verifyingUser.verificationCode}`,
        variant: "destructive",
      })
    }
  }

  const filteredUsers = users.filter((user) => user.phone.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8 bg-white rounded-xl shadow-sm p-6 flex items-center justify-between transition-all duration-300 hover:shadow-md">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-3 rounded-lg shadow-lg">
              <LayoutDashboard className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome to Xerox Karao</h1>
              <p className="text-sm text-gray-500">Admin Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2">
              <div className="flex flex-col items-end">
                <span className="font-medium text-gray-900">Admin User</span>
                <span className="text-xs text-gray-500">admin@xeroxkarao.com</span>
              </div>
              <Avatar className="h-10 w-10 border-2 border-emerald-500">
                <AvatarImage src="/placeholder.svg" alt="Admin" />
                <AvatarFallback className="bg-emerald-100 text-emerald-700">AD</AvatarFallback>
              </Avatar>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="border-gray-300 hover:bg-gray-100 hover:text-gray-900 transition-all duration-300"
            >
              Sign Out
            </Button>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-xl shadow-sm transition-all duration-300 hover:shadow-md flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Users</p>
              <h3 className="text-2xl font-bold text-gray-900">{users.length}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm transition-all duration-300 hover:shadow-md flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Documents</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {users.reduce((sum, user) => sum + user.documents.length, 0)}
              </h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm transition-all duration-300 hover:shadow-md flex items-center gap-4">
            <div className="bg-amber-100 p-3 rounded-lg">
              <Search className="h-6 w-6 text-amber-600" />
            </div>
            <div className="w-full">
              <p className="text-sm text-gray-500 mb-2">Search Users</p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by phone number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-emerald-500 focus:ring focus:ring-emerald-200 transition-all duration-300"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* User List */}
          <div className="flex-grow">
            <div className="bg-white rounded-xl shadow-sm p-6 transition-all duration-300 hover:shadow-md">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-500" />
                User Queue
              </h2>

              {isLoading ? (
                <div className="py-12 flex flex-col items-center justify-center">
                  <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full mb-4"></div>
                  <p className="text-gray-500">Loading users...</p>
                </div>
              ) : (
                <UserList
                  users={filteredUsers}
                  onUserSelect={(user) => setSelectedUser(user)}
                  onUserComplete={handleUserComplete}
                  onUserReject={handleUserReject}
                />
              )}

              {!isLoading && users.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-gray-500">No users in queue</p>
                  <Button variant="outline" className="mt-4" onClick={addSampleUsers}>
                    Add Sample User (For Testing)
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Code Verification */}
          {verifyingUser && (
            <div className="lg:w-1/3 animate-fadeIn">
              <CodeVerification onVerify={handleVerifyCode} userName={verifyingUser.phone} />
            </div>
          )}
        </div>

        {/* Document Details Dialog */}
        <DocumentDetailsDialog user={selectedUser} open={!!selectedUser} onOpenChange={() => setSelectedUser(null)} />
      </div>
    </div>
  )
}
