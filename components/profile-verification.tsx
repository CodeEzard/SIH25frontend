"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, CheckCircle, Clock, AlertCircle, User, FileText, Camera } from "lucide-react"

interface UserProfile {
  walletAddress: string
  role: string
  name?: string
  email?: string
  isVerified: boolean
  verificationStatus: "unverified" | "pending" | "verified" | "rejected"
}

interface ProfileVerificationProps {
  userProfile: UserProfile | null
  onStartVerification: () => void
}

export default function ProfileVerification({ userProfile, onStartVerification }: ProfileVerificationProps) {
  if (!userProfile) return null

  const getVerificationBadge = () => {
    switch (userProfile.verificationStatus) {
      case "verified":
        return (
          <Badge className="bg-green-900/30 text-green-300 border-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-yellow-900/30 text-yellow-300 border-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-red-900/30 text-red-300 border-red-800">
            <AlertCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        )
      default:
        return (
          <Badge className="bg-gray-800 text-gray-400 border-gray-700">
            <Shield className="h-3 w-3 mr-1" />
            Unverified
          </Badge>
        )
    }
  }

  const getVerificationContent = () => {
    switch (userProfile.verificationStatus) {
      case "verified":
        return (
          <div className="text-center py-4">
            <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-white mb-2">Profile Verified</h3>
            <p className="text-sm text-gray-400 mb-4">
              Your student profile has been successfully verified. You can now request NFT credentials from
              universities.
            </p>
            <div className="text-xs text-gray-500">Verified on {new Date().toLocaleDateString()}</div>
          </div>
        )
      case "pending":
        return (
          <div className="text-center py-4">
            <div className="relative mx-auto mb-3">
              <Clock className="h-12 w-12 text-yellow-400" />
              <div className="absolute inset-0 animate-ping">
                <Clock className="h-12 w-12 text-yellow-400 opacity-20" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Verification in Progress</h3>
            <p className="text-sm text-gray-400 mb-4">
              We're reviewing your submitted documents. This process typically takes 1-3 business days.
            </p>
            <div className="text-xs text-gray-500">Submitted on {new Date().toLocaleDateString()}</div>
          </div>
        )
      case "rejected":
        return (
          <div className="text-center py-4">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-white mb-2">Verification Rejected</h3>
            <p className="text-sm text-gray-400 mb-4">
              Your verification was rejected. Please review the requirements and submit again with valid documents.
            </p>
            <Button onClick={onStartVerification} className="bg-white text-black hover:bg-gray-100" size="sm">
              Try Again
            </Button>
          </div>
        )
      default:
        return (
          <div className="space-y-4">
            <div className="text-center">
              <Shield className="h-12 w-12 text-gray-600 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-white mb-2">Verify Your Student Profile</h3>
              <p className="text-sm text-gray-400 mb-4">
                Complete profile verification to request NFT credentials from universities. This helps ensure the
                authenticity of your academic achievements.
              </p>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                <User className="h-5 w-5 text-blue-400" />
                <div>
                  <p className="text-white font-medium">Personal Information</p>
                  <p className="text-gray-400">Full name, email, and contact details</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                <FileText className="h-5 w-5 text-green-400" />
                <div>
                  <p className="text-white font-medium">Student ID Document</p>
                  <p className="text-gray-400">Valid student ID or enrollment letter</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                <Camera className="h-5 w-5 text-purple-400" />
                <div>
                  <p className="text-white font-medium">Identity Verification</p>
                  <p className="text-gray-400">Government-issued photo ID</p>
                </div>
              </div>
            </div>

            <Button onClick={onStartVerification} className="w-full bg-white text-black hover:bg-gray-100">
              <Shield className="h-4 w-4 mr-2" />
              Start Verification Process
            </Button>

            <p className="text-xs text-gray-500 text-center">
              Verification is required to maintain platform security and trust
            </p>
          </div>
        )
    }
  }

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-white">
            <Shield className="h-5 w-5" />
            Profile Verification
          </CardTitle>
          {getVerificationBadge()}
        </div>
      </CardHeader>
      <CardContent>{getVerificationContent()}</CardContent>
    </Card>
  )
}
