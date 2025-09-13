"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, Shield, User, ExternalLink } from "lucide-react"

export default function QuickActions() {
  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-lg text-white">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          variant="outline"
          className="w-full justify-start border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white bg-transparent"
          size="sm"
        >
          <Eye className="h-4 w-4 mr-2" />
          View Full Credential Portfolio
        </Button>

        <Button
          variant="outline"
          className="w-full justify-start border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white bg-transparent"
          size="sm"
        >
          <Shield className="h-4 w-4 mr-2" />
          Verify a Credential
        </Button>

        <Button
          variant="outline"
          className="w-full justify-start border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white bg-transparent"
          size="sm"
        >
          <User className="h-4 w-4 mr-2" />
          Edit My Profile
        </Button>

        <Button
          variant="outline"
          className="w-full justify-start border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white bg-transparent"
          size="sm"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Help & Support
        </Button>
      </CardContent>
    </Card>
  )
}
