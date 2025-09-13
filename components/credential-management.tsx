"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Award, Plus, Edit, Eye, BarChart3 } from "lucide-react"

interface Credential {
  id: string
  name: string
  type: string
  description: string
  totalIssued: number
  status: "active" | "inactive"
  createdDate: string
}

interface CredentialManagementProps {
  credentials: Credential[]
  setCredentials: (credentials: Credential[]) => void
}

export default function CredentialManagement({ credentials, setCredentials }: CredentialManagementProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newCredential, setNewCredential] = useState({
    name: "",
    type: "",
    description: "",
  })

  const handleCreateCredential = () => {
    const credential: Credential = {
      id: Date.now().toString(),
      name: newCredential.name,
      type: newCredential.type,
      description: newCredential.description,
      totalIssued: 0,
      status: "active",
      createdDate: new Date().toISOString(),
    }

    setCredentials([...credentials, credential])
    setNewCredential({ name: "", type: "", description: "" })
    setIsCreateDialogOpen(false)
  }

  const getStatusBadge = (status: Credential["status"]) => {
    return status === "active" ? (
      <Badge className="bg-green-900/30 text-green-300 border-green-800">Active</Badge>
    ) : (
      <Badge className="bg-gray-800 text-gray-400 border-gray-700">Inactive</Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Credential Management</h2>
          <p className="text-gray-400">Manage the types of credentials your university can issue</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 transition-all duration-200 transform hover:scale-105 shadow-lg shadow-purple-500/25">
              <Plus className="h-4 w-4 mr-2" />
              New Credential Type
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gradient-to-br from-gray-900/90 via-black/80 to-purple-900/20 border border-gray-800/60 backdrop-blur-xl shadow-2xl text-white">
            <DialogHeader>
              <DialogTitle className="text-white">Create New Credential Type</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Credential Name</label>
                <Input
                  placeholder="e.g., Bachelor of Science in Computer Science"
                  value={newCredential.name}
                  onChange={(e) => setNewCredential({ ...newCredential, name: e.target.value })}
                  className="bg-gray-800/60 border-gray-700/60 text-white placeholder-gray-400 focus:border-purple-600/60 focus:ring-purple-600/20 transition-all duration-200"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Type</label>
                <Input
                  placeholder="e.g., Undergraduate Degree, Certificate"
                  value={newCredential.type}
                  onChange={(e) => setNewCredential({ ...newCredential, type: e.target.value })}
                  className="bg-gray-800/60 border-gray-700/60 text-white placeholder-gray-400 focus:border-purple-600/60 focus:ring-purple-600/20 transition-all duration-200"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Description</label>
                <Textarea
                  placeholder="Describe this credential..."
                  value={newCredential.description}
                  onChange={(e) => setNewCredential({ ...newCredential, description: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleCreateCredential}
                  disabled={!newCredential.name || !newCredential.type}
                  className="bg-white text-black hover:bg-gray-100"
                >
                  Create Credential
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Available Credentials */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Available Certificate Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {credentials.map((credential) => (
              <Card key={credential.id} className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <Award className="h-5 w-5 text-blue-400" />
                    {getStatusBadge(credential.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-white text-sm">{credential.name}</h3>
                    <p className="text-xs text-gray-400">{credential.type}</p>
                  </div>
                  <p className="text-sm text-gray-300 line-clamp-2">{credential.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Issued: {credential.totalIssued}</span>
                    <span className="text-gray-500">{new Date(credential.createdDate).getFullYear()}</span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
                    >
                      <BarChart3 className="h-3 w-3 mr-1" />
                      Stats
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Issued Credentials Overview */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Recently Issued Credentials</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <Award className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="font-medium text-white">Bachelor of Science in Computer Science</p>
                    <p className="text-sm text-gray-400">Issued to John Smith • 2 days ago</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-700 text-gray-300 hover:bg-gray-700 bg-transparent"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
