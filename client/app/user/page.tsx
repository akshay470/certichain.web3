"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion } from "framer-motion"
import { jsPDF } from "jspdf"
import { User, Edit, Download, Award, Calendar, Briefcase, Building } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface UserProfile {
  username: string
  email: string
  age: string
  profileImage: string | null
}

interface Certificate {
  id: string
  name: string
  issuer: string
  date: string
  type: "course" | "company"
  details: {
    [key: string]: string
  }
  image: string
}

export default function UserPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [nfts, setNfts] = useState<any[]>([])

  const [walletAddress, setWalletAddress] = useState("")
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [isProfileComplete, setIsProfileComplete] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null)

  const [profile, setProfile] = useState<UserProfile>({
    username: "",
    email: "",
    age: "",
    profileImage: null,
  })

  const [certificates, setCertificates] = useState<Certificate[]>([
    {
      id: "cert-1",
      name: "Full Stack Web Development",
      issuer: "Tech Academy",
      date: "2023-05-15",
      type: "course",
      details: {
        duration: "6 months",
        grade: "A+",
        skills: "React, Node.js, MongoDB",
      },
      image: "/placeholder.svg?height=400&width=600",
    },
    {
      id: "cert-2",
      name: "Software Engineer",
      issuer: "TechCorp Inc.",
      date: "2022-12-10",
      type: "company",
      details: {
        position: "Senior Developer",
        joinDate: "2020-01-15",
        resignDate: "2022-12-01",
        remarks: "Excellent team player with strong problem-solving skills",
      },
      image: "/placeholder.svg?height=400&width=600",
    },
  ])


console.log(walletAddress);
  useEffect(() => {
    const fetchNFTs = async () => {
      if (!walletAddress) return

      try {
        const response = await fetch(
          `https://api.opensea.io/api/v2/chain/ethereum/account/${walletAddress}/nfts?limit=20`,
          {
            headers: {
              // Add your API key if you have one:
              // 'x-api-key': 'YOUR_OPENSEA_API_KEY',
            },
          }
        )

        const data = await response.json()
        setNfts(data.nfts || [])
      } catch (error) {
        console.error('Error fetching NFTs:', error)
      }
    }

    fetchNFTs()
  }, [walletAddress])
  console.log("Fetched NFTs:", nfts)

  useEffect(() => {
    // Check if user is logged in
    const address = localStorage.getItem("walletAddress")
    const userType = localStorage.getItem("userType")

    if (!address || userType !== "user") {
      router.push("/")
      return
    }

    setWalletAddress(address)

    // Check if profile is already set
    const savedProfile = localStorage.getItem("userProfile")
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile))
      setIsProfileComplete(true)
    } else {
      setIsProfileModalOpen(true)
    }

    // Load certificates from localStorage if available
    const savedCertificates = localStorage.getItem("userCertificates")
    if (savedCertificates) {
      setCertificates(JSON.parse(savedCertificates))
    }
  }, [router])

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!profile.username || !profile.email || !profile.age) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    localStorage.setItem("userProfile", JSON.stringify(profile))
    setIsProfileComplete(true)
    setIsProfileModalOpen(false)

    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated",
    })
  }

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        setProfile({
          ...profile,
          profileImage: event.target.result as string,
        })
      }
    }
    reader.readAsDataURL(file)
  }

  const generateResume = () => {
    const doc = new jsPDF()

    // Add header
    doc.setFontSize(22)
    doc.setTextColor(75, 0, 130)
    doc.text("Professional Resume", 105, 20, { align: "center" })

    // Add personal info
    doc.setFontSize(16)
    doc.setTextColor(0, 0, 0)
    doc.text(`${profile.username}`, 20, 40)
    doc.setFontSize(12)
    doc.text(`Email: ${profile.email}`, 20, 50)
    doc.text(`Wallet: ${walletAddress.substring(0, 8)}...${walletAddress.substring(36)}`, 20, 60)

    // Add certificates
    doc.setFontSize(16)
    doc.setTextColor(75, 0, 130)
    doc.text("Certificates & Credentials", 20, 80)

    let yPosition = 90

    certificates.forEach((cert, index) => {
      // Check if we need a new page
      if (yPosition > 250) {
        doc.addPage()
        yPosition = 20
      }

      doc.setFontSize(14)
      doc.setTextColor(0, 0, 0)
      doc.text(`${index + 1}. ${cert.name}`, 20, yPosition)

      doc.setFontSize(12)
      doc.setTextColor(100, 100, 100)
      doc.text(`Issuer: ${cert.issuer}`, 25, yPosition + 10)
      doc.text(`Date: ${new Date(cert.date).toLocaleDateString()}`, 25, yPosition + 20)

      if (cert.type === "course") {
        doc.text(`Duration: ${cert.details.duration}`, 25, yPosition + 30)
        doc.text(`Grade: ${cert.details.grade}`, 25, yPosition + 40)
        yPosition += 50
      } else {
        doc.text(`Position: ${cert.details.position}`, 25, yPosition + 30)
        doc.text(
          `Period: ${new Date(cert.details.joinDate).toLocaleDateString()} - ${new Date(cert.details.resignDate).toLocaleDateString()}`,
          25,
          yPosition + 40,
        )
        yPosition += 50
      }
    })

    // Add verification note
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text("All certificates are blockchain-verified and can be authenticated via CertChain platform", 105, 280, {
      align: "center",
    })

    // Save the PDF
    doc.save(`${profile.username.replace(/\s+/g, "_")}_Resume.pdf`)

    toast({
      title: "Resume Generated",
      description: "Your resume has been successfully generated and downloaded",
    })
  }

  const viewCertificate = (cert: Certificate) => {
    setSelectedCertificate(cert)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
      {/* Profile Setup Modal */}
      <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Your Profile</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleProfileSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={profile.username}
                onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                placeholder="Enter your name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={profile.age}
                onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                placeholder="Enter your age"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profileImage">Profile Photo</Label>
              <div className="flex items-center space-x-4">
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                  Upload Photo
                </Button>
                {profile.profileImage && (
                  <div className="h-12 w-12 rounded-full overflow-hidden">
                    <Image
                      src={profile.profileImage || "/placeholder.svg"}
                      alt="Profile preview"
                      width={48}
                      height={48}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfileImageUpload}
                />
              </div>
            </div>

            <Button type="submit" className="w-full">
              Save Profile
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Profile Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Your Profile</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              localStorage.setItem("userProfile", JSON.stringify(profile))
              setIsEditModalOpen(false)
              toast({
                title: "Profile Updated",
                description: "Your profile has been successfully updated",
              })
            }}
            className="space-y-4 pt-4"
          >
            <div className="space-y-2">
              <Label htmlFor="edit-username">Username</Label>
              <Input
                id="edit-username"
                value={profile.username}
                onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                placeholder="Enter your name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-age">Age</Label>
              <Input
                id="edit-age"
                type="number"
                value={profile.age}
                onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                placeholder="Enter your age"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-profileImage">Profile Photo</Label>
              <div className="flex items-center space-x-4">
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                  Change Photo
                </Button>
                {profile.profileImage && (
                  <div className="h-12 w-12 rounded-full overflow-hidden">
                    <Image
                      src={profile.profileImage || "/placeholder.svg"}
                      alt="Profile preview"
                      width={48}
                      height={48}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfileImageUpload}
                />
              </div>
            </div>

            <Button type="submit" className="w-full">
              Update Profile
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Certificate View Modal */}
      <Dialog open={!!selectedCertificate} onOpenChange={(open) => !open && setSelectedCertificate(null)}>
        <DialogContent className="sm:max-w-xl">
          {selectedCertificate && (
            <div className="space-y-6">
              <div className="relative">
                <Image
                  src={selectedCertificate.image || "/placeholder.svg"}
                  alt={selectedCertificate.name}
                  width={600}
                  height={400}
                  className="w-full rounded-lg"
                />
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold">{selectedCertificate.name}</h2>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Building className="h-5 w-5 text-purple-500" />
                    <span>Issuer: {selectedCertificate.issuer}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-purple-500" />
                    <span>Date: {new Date(selectedCertificate.date).toLocaleDateString()}</span>
                  </div>

                  {selectedCertificate.type === "course" ? (
                    <>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-5 w-5 text-purple-500" />
                        <span>Duration: {selectedCertificate.details.duration}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Award className="h-5 w-5 text-purple-500" />
                        <span>Grade: {selectedCertificate.details.grade}</span>
                      </div>
                      {selectedCertificate.details.skills && (
                        <div className="col-span-2 flex items-start space-x-2">
                          <Award className="h-5 w-5 text-purple-500 mt-0.5" />
                          <span>Skills: {selectedCertificate.details.skills}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="flex items-center space-x-2">
                        <Briefcase className="h-5 w-5 text-purple-500" />
                        <span>Position: {selectedCertificate.details.position}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-5 w-5 text-purple-500" />
                        <span>
                          Period: {new Date(selectedCertificate.details.joinDate).toLocaleDateString()} -{" "}
                          {new Date(selectedCertificate.details.resignDate).toLocaleDateString()}
                        </span>
                      </div>
                      {selectedCertificate.details.remarks && (
                        <div className="col-span-2 flex items-start space-x-2">
                          <Award className="h-5 w-5 text-purple-500 mt-0.5" />
                          <span>Remarks: {selectedCertificate.details.remarks}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="pt-4 flex justify-end">
                  <Button variant="outline" onClick={() => setSelectedCertificate(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {isProfileComplete && (
        <div className="container mx-auto px-4 py-8">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-8"
          >
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="relative h-24 w-24 md:h-32 md:w-32">
                {profile.profileImage ? (
                  <Image
                    src={profile.profileImage || "/placeholder.svg"}
                    alt={profile.username}
                    fill
                    className="rounded-full object-cover border-4 border-purple-500"
                  />
                ) : (
                  <div className="h-full w-full rounded-full bg-purple-700 flex items-center justify-center">
                    <User className="h-16 w-16 text-white" />
                  </div>
                )}
              </div>

              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-bold text-white">{profile.username}</h1>
                <p className="text-purple-200 mt-1">{profile.email}</p>
                <p className="text-purple-300 text-sm mt-1">Age: {profile.age}</p>
                <p className="text-purple-300 text-sm mt-1 font-mono">
                  Wallet: {walletAddress.substring(0, 8)}...{walletAddress.substring(36)}
                </p>
              </div>

              <Button
                variant="outline"
                className="border-purple-400 text-purple-100"
                onClick={() => setIsEditModalOpen(true)}
              >
                <Edit className="h-4 w-4 mr-2" /> Edit Profile
              </Button>
            </div>
          </motion.div>

         {/* Certificates Section */}
         <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">My Certificates & Credentials</h2>

            {certificates.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 text-center">
                <p className="text-purple-200">You don't have any certificates yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {certificates.map((cert, index) => (
                  <motion.div
                    key={cert.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{
                      scale: 1.05,
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                    }}
                  >
                    <Card
                      className="overflow-hidden bg-white/10 backdrop-blur-md border-purple-400/30 cursor-pointer"
                      onClick={() => viewCertificate(cert)}
                    >
                      <div className="relative h-48">
                        <Image src={cert.image || "/placeholder.svg"} alt={cert.name} fill className="object-cover" />
                        <div className="absolute top-2 right-2 bg-purple-700 text-white text-xs px-2 py-1 rounded-full">
                          {cert.type === "course" ? "Course" : "Company"}
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-bold text-lg text-white truncate">{cert.name}</h3>
                        <div className="flex justify-between items-center mt-2">
                          <p className="text-purple-200 text-sm">{cert.issuer}</p>
                          <p className="text-purple-300 text-xs">{new Date(cert.date).toLocaleDateString()}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Resume Generation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex justify-center mt-12"
          >
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              onClick={generateResume}
              disabled={certificates.length === 0}
            >
              <Download className="mr-2 h-5 w-5" /> Generate Resume
            </Button>
          </motion.div>
        </div>
      )}
    </div>
  )
}

