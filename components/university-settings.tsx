"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Building2, Wallet, Shield, Save, Upload } from "lucide-react"

interface University {
  id: string
  name: string
  description: string
  website: string
  walletAddress: string
  verified: boolean
  adminName: string
  adminRole: string
  logo: string
  banner: string
}

interface UniversitySettingsProps {
  university: University
  setUniversity: (university: University) => void
}

export default function UniversitySettings({ university, setUniversity }: UniversitySettingsProps) {
  const [formData, setFormData] = useState(university)
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    // Mock API call
    setTimeout(() => {
      setUniversity(formData)
      setLoading(false)
    }, 1000)
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">University Settings</h2>
        <p className="text-gray-400">Manage your university profile and platform settings</p>
      </div>

      {/* Profile Settings */}
      <Card className="bg-gradient-to-br from-gray-900/90 via-black/80 to-purple-900/20 border border-gray-800/60 backdrop-blur-xl shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Building2 className="h-5 w-5 text-purple-400" />
            Profile Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">University Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-gray-800/60 border-gray-700/60 text-white placeholder-gray-400 focus:border-purple-600/60 focus:ring-purple-600/20 transition-all duration-200"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">Website URL</label>
              <Input
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="bg-gray-800/60 border-gray-700/60 text-white placeholder-gray-400 focus:border-purple-600/60 focus:ring-purple-600/20 transition-all duration-200"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-gray-800/60 border-gray-700/60 text-white placeholder-gray-400 focus:border-purple-600/60 focus:ring-purple-600/20 transition-all duration-200"
              rows={4}
            />
          </div>



          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={loading} className="bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 transition-all duration-200 transform hover:scale-105 shadow-lg shadow-purple-500/25">
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Wallet Management */}
      <Card className="bg-gradient-to-br from-gray-900/90 via-black/80 to-purple-900/20 border border-gray-800/60 backdrop-blur-xl shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Wallet className="h-5 w-5 text-purple-400" />
            Wallet Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-800/40 rounded-lg border border-gray-700/60">
            <div>
              <p className="font-medium text-white">Official Minting Wallet</p>
              <p className="text-sm text-gray-400 font-mono">{university.walletAddress}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-900/30 text-green-300 border-green-800">
                <Shield className="h-3 w-3 mr-1" />
                Verified
              </Badge>
              <Button
                variant="outline"
                size="sm"
                className="border-purple-700/60 text-purple-300 hover:bg-purple-900/20 bg-transparent transition-all duration-200"
              >
                Update
              </Button>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            This wallet address is used for minting NFT credentials. Changes require verification.
          </p>
        </CardContent>
      </Card>

      {/* Verification Status */}
      <Card className="bg-gradient-to-br from-gray-900/90 via-black/80 to-purple-900/20 border border-gray-800/60 backdrop-blur-xl shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Shield className="h-5 w-5 text-purple-400" />
            Verification Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-green-900/20 border border-green-800 rounded-lg">
            <div>
              <p className="font-medium text-green-300">University Verified</p>
              <p className="text-sm text-green-200">Your university has been verified on the VeriCred platform</p>
            </div>
            <Badge className="bg-green-900/30 text-green-300 border-green-800">
              <Shield className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
