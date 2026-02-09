"use client"


import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion } from "framer-motion"
import { User, Edit, Upload, Building, Award, Briefcase, CheckCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import contractABI from "../contract_data/AcademicNFT.json";
import contractAddress from "../contract_data/AcademicNFT-address.json";
import { title } from "framer-motion/client";
import {ethers} from "ethers"
import { uploadFile } from "@/lib/ipfs";
// import fs from 'fs'
import path from "path"
interface IssuerProfile {
  username: string
  email: string
  organization: string
  profileImage: string | null
}

interface Certificate {
  id: string
  recipientAddress: string
  name: string
  issuer: string
  date: string
  type: "course" | "company"
  details: {
    [key: string]: string
  }
  image: string
}

export default function IssuerPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const certificateFileRef = useRef<HTMLInputElement>(null)

  const [walletAddress, setWalletAddress] = useState("")
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [isProfileComplete, setIsProfileComplete] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [certificateType, setCertificateType] = useState<"course" | "company">("course")
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const[certificateImage,setCertificateImage] = useState<string>(""); 
  const [issuedCertificates, setIssuedCertificates] = useState<Certificate[]>([])
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)
  const [value, setValue] = useState(""); 
  const [retrievedValue, setRetrievedValue] = useState(null);
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [userBalance, setUserBalance] = useState(null);
  const [cid, setCid] = useState("");

  const [profile, setProfile] = useState<IssuerProfile>({
    username: "",
    email: "",
    organization: "",
    profileImage: null,
  })

  const funcParams = {
    student: "0x4799CC4983a60DFe11233871c6E0D380179A056D",
    title: "test certi",
    issuer: "teacher",
    grade: "Z",
    tokenURI: "ipfs://HASH_"
  }

  const handleUpload = async () => {
    try {
      const returnedCid = await uploadFile(certificateFile); // call the upload function
      setCid(returnedCid); // store the CID in state
      console.log("CID:", returnedCid);
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  const initializeEthers = async () => {
      if (!window.ethereum) {
        alert("MetaMask not detected!");
        return;
      }
      
      try {
        const _provider = new ethers.BrowserProvider(window.ethereum);
        const _signer = await _provider.getSigner();
        const _contract = new ethers.Contract(contractAddress.address, contractABI.abi, _signer);
  
        setProvider(_provider);
        setSigner(_signer);
        setContract(_contract);
  
        const accounts = await _provider.send("eth_requestAccounts", []);
        setAccount(accounts[0]);
      } catch (error) {
        console.error("Error initializing ethers:", error);
      }
    };

    const setContractValue = async () => {
        if (!contract) return alert("Please connect wallet first!");
        try {
          const tx = await contract.set(BigInt(value)); // Convert string to BigInt
          await tx.wait(); // Wait for transaction confirmation
          alert("Value set successfully!");
        } catch (error) {
          console.error("Error setting value:", error);
        }
      };
    
      useEffect(() => {
        if (window.ethereum) {
          initializeEthers();
        }
      }, []);

      const [certificateForm, setCertificateForm] = useState({
        recipientAddress: "",
        name: "",
        // Course specific
        courseName: "",
        courseDuration: "",
        courseGrade: "",
        // Company specific
        position: "",
        joinDate: "",
        resignDate: "",
        remarks: "",
      })

      const issueCerti = async () => {
        if (!contract) return alert("Please connect wallet first!");
      
        try {
          // const { student, title, issuer, grade, tokenURI } = funcParams;
          console.log("is this what we are looking for",certificateForm);
          console.log(walletAddress)
          console.log(certificateForm.courseGrade)


          const imgUrl = `ipfs://${cid}`
          console.log(imgUrl)

          // using fs module overwrite metadata.json in lib dir
          const metadata = {
            name: certificateForm.courseName,
            description: certificateForm.courseGrade,
            image: imgUrl,
          };
          const metadataBlob = new Blob([JSON.stringify(metadata, null, 2)], { type: "application/json" });
          const metadataFile = new File([metadataBlob], "metadata.json", { type: "application/json" });

          // upload the json to ipfs using the pinata upload func // Adjust path to your upload function
              const metadataCid = await uploadFile(metadataFile);
              console.log(`Metadata uploaded: ipfs://${metadataCid}`);
              issueCertificate(metadataCid);


          // pass the cid issueCertificate
          // function issueCertificate(metadataCid) {
          //   // Your logic here to mint the NFT using this metadataCid
          //   const tokenURI = `ipfs://${metadataCid}`;
          //   console.log("Issuing certificate with metadata:", tokenURI);
          
          //   // Call your smart contract mint function here using tokenURI
          // }
          

      
          const tx = await contract.issueCertificate(
            certificateForm.recipientAddress,          // address
            certificateForm.courseName,
            "fdsfdsfsd",            // string       // string
            certificateForm.courseGrade,    // uint256 (make sure it's a number)
            `ipfs://${metadataCid}`      // string (usually an IPFS URI)
          );
      
          await tx.wait();
          console.log("Transaction successful:", tx);
        } catch (error) {
          console.error("Error issuing certificate:", error);
        }
      };


  useEffect(() => {
    // Check if user is logged in
    const address = localStorage.getItem("walletAddress")
    const userType = localStorage.getItem("userType")

    if (!address || userType !== "issuer") {
      router.push("/")
      return
    }

    setWalletAddress(address)

    // Check if profile is already set
    const savedProfile = localStorage.getItem("issuerProfile")
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile))
      setIsProfileComplete(true)
    } else {
      setIsProfileModalOpen(true)
    }

    // Load issued certificates from localStorage if available
    const savedCertificates = localStorage.getItem("issuedCertificates")
    if (savedCertificates) {
      setIssuedCertificates(JSON.parse(savedCertificates))
    }
  }, [router])

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!profile.username || !profile.email || !profile.organization) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    localStorage.setItem("issuerProfile", JSON.stringify(profile))
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

  const handleCertificateImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
  
    setCertificateFile(file); // just store the file object
  };

  const issueCertificate = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!certificateForm.recipientAddress || !certificateFile) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and upload a certificate image",
        variant: "destructive",
      })
      return
    }

    try {
      // In a real application, this would mint an NFT
      // For this demo, we'll simulate the process

      // Create certificate object
      const newCertificate: Certificate = {
        id: `cert-${Date.now()}`,
        recipientAddress: certificateForm.recipientAddress,
        name: certificateType === "course" ? certificateForm.courseName : certificateForm.position,
        issuer: profile.organization,
        date: new Date().toISOString(),
        type: certificateType,
        details:
          certificateType === "course"
            ? {
                duration: certificateForm.courseDuration,
                grade: certificateForm.courseGrade,
              }
            : {
                position: certificateForm.position,
                joinDate: certificateForm.joinDate,
                resignDate: certificateForm.resignDate,
                remarks: certificateForm.remarks,
              },
        image: `ipfs://${cid}`,
      }

      // Add to issued certificates
      const updatedCertificates = [...issuedCertificates, newCertificate]
      setIssuedCertificates(updatedCertificates)
      localStorage.setItem("issuedCertificates", JSON.stringify(updatedCertificates))

      // Show success alert
      setShowSuccessAlert(true)
      setTimeout(() => setShowSuccessAlert(false), 5000)

      // Reset form
      // setCertificateForm({
      //   recipientAddress: "",
      //   name: "",
      //   courseName: "",
      //   courseDuration: "",
      //   courseGrade: "",
      //   position: "",
      //   joinDate: "",
      //   resignDate: "",
      //   remarks: "",
      // })
      // setCertificateImage(null)

      toast({
        title: "Certificate Issued",
        description: "The certificate has been successfully issued as an NFT",
      })
    } catch (error) {
      console.error("Error issuing certificate:", error)
      toast({
        title: "Error",
        description: "Failed to issue certificate. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
      {/* Profile Setup Modal */}
      <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Your Issuer Profile</DialogTitle>
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
              <Label htmlFor="organization">Organization</Label>
              <Input
                id="organization"
                value={profile.organization}
                onChange={(e) => setProfile({ ...profile, organization: e.target.value })}
                placeholder="Enter your organization name"
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
              localStorage.setItem("issuerProfile", JSON.stringify(profile))
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
              <Label htmlFor="edit-organization">Organization</Label>
              <Input
                id="edit-organization"
                value={profile.organization}
                onChange={(e) => setProfile({ ...profile, organization: e.target.value })}
                placeholder="Enter your organization name"
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

      {isProfileComplete && (
        <div className="container mx-auto px-4 py-8">
          {/* Success Alert */}
          {showSuccessAlert && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-4 right-4 z-50 max-w-md"
            >
              <Alert className="bg-green-600 text-white border-green-700">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Success!</AlertTitle>
                <AlertDescription>
                  NFT Certificate has been successfully transferred to the recipient's wallet.
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

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
                <p className="text-purple-300 text-sm mt-1">
                  <Building className="inline h-4 w-4 mr-1" /> {profile.organization}
                </p>
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

          {/* Certificate Issuance Form */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-2">
              <Card className="bg-white/10 backdrop-blur-md border-purple-400/30">
                <CardHeader>
                  <CardTitle className="text-white">Issue New Certificate</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={issueCertificate} className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="recipientAddress" className="text-purple-100">
                          Recipient's Wallet Address
                        </Label>
                        <Input
                          id="recipientAddress"
                          value={certificateForm.recipientAddress}
                          onChange={(e) => setCertificateForm({ ...certificateForm, recipientAddress: e.target.value })}
                          placeholder="0x..."
                          className="bg-white/20 border-purple-400/30 text-white placeholder:text-purple-300"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-purple-100">Certificate Type</Label>
                        <RadioGroup
                          value={certificateType}
                          onValueChange={(value) => setCertificateType(value as "course" | "company")}
                          className="flex space-x-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="course" id="course" />
                            <Label htmlFor="course" className="text-purple-100">
                              Course Certificate
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="company" id="company" />
                            <Label htmlFor="company" className="text-purple-100">
                              Company Credential
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <Tabs value={certificateType} className="mt-6">
                        <TabsContent value="course" className="space-y-4 mt-4">
                          <div className="space-y-2">
                            <Label htmlFor="courseName" className="text-purple-100">
                              Course Name
                            </Label>
                            <Input
                              id="courseName"
                              value={certificateForm.courseName}
                              onChange={(e) => setCertificateForm({ ...certificateForm, courseName: e.target.value })}
                              placeholder="e.g. Full Stack Web Development"
                              className="bg-white/20 border-purple-400/30 text-white placeholder:text-purple-300"
                              required
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="courseDuration" className="text-purple-100">
                                Course Duration
                              </Label>
                              <Input
                                id="courseDuration"
                                value={certificateForm.courseDuration}
                                onChange={(e) =>
                                  setCertificateForm({ ...certificateForm, courseDuration: e.target.value })
                                }
                                placeholder="e.g. 6 months"
                                className="bg-white/20 border-purple-400/30 text-white placeholder:text-purple-300"
                                required
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="courseGrade" className="text-purple-100">
                                Grade/Score
                              </Label>
                              <Input
                                id="courseGrade"
                                value={certificateForm.courseGrade}
                                onChange={(e) =>
                                  setCertificateForm({ ...certificateForm, courseGrade: e.target.value })
                                }
                                placeholder="e.g. A+ or 95%"
                                className="bg-white/20 border-purple-400/30 text-white placeholder:text-purple-300"
                                required
                              />
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="company" className="space-y-4 mt-4">
                          <div className="space-y-2">
                            <Label htmlFor="position" className="text-purple-100">
                              Position at Company
                            </Label>
                            <Input
                              id="position"
                              value={certificateForm.position}
                              onChange={(e) => setCertificateForm({ ...certificateForm, position: e.target.value })}
                              placeholder="e.g. Senior Software Engineer"
                              className="bg-white/20 border-purple-400/30 text-white placeholder:text-purple-300"
                              required
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="joinDate" className="text-purple-100">
                                Joining Date
                              </Label>
                              <Input
                                id="joinDate"
                                type="date"
                                value={certificateForm.joinDate}
                                onChange={(e) => setCertificateForm({ ...certificateForm, joinDate: e.target.value })}
                                className="bg-white/20 border-purple-400/30 text-white"
                                required
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="resignDate" className="text-purple-100">
                                Resigning Date
                              </Label>
                              <Input
                                id="resignDate"
                                type="date"
                                value={certificateForm.resignDate}
                                onChange={(e) => setCertificateForm({ ...certificateForm, resignDate: e.target.value })}
                                className="bg-white/20 border-purple-400/30 text-white"
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="remarks" className="text-purple-100">
                              Remarks
                            </Label>
                            <Textarea
                              id="remarks"
                              value={certificateForm.remarks}
                              onChange={(e) => setCertificateForm({ ...certificateForm, remarks: e.target.value })}
                              placeholder="Additional comments about the employee"
                              className="bg-white/20 border-purple-400/30 text-white placeholder:text-purple-300"
                              rows={3}
                            />
                          </div>
                        </TabsContent>
                      </Tabs>

                      <div className="space-y-2 pt-4">
                        <Label htmlFor="certificateImage" className="text-purple-100">
                          Upload Certificate
                        </Label>
                        <div className="flex flex-col items-center space-y-4 p-6 border-2 border-dashed border-purple-400/30 rounded-lg">
                          {certificateImage ? (
                            <div className="relative w-full max-w-md h-48">
                              <Image
                                src={certificateImage || "/placeholder.svg"}
                                alt="Certificate preview"
                                fill
                                className="object-contain"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-2 right-2"
                                onClick={() => setCertificateImage(null)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <>
                              <Upload className="h-12 w-12 text-purple-400" />
                              <p className="text-purple-200 text-center">
                                Drag and drop your certificate image here, or click to browse
                              </p>
                            </>
                          )}
                          <Button
                            type="button"
                            variant="outline"
                            className="border-purple-400 text-purple-100"
                            onClick={() => certificateFileRef.current?.click()}
                          >
                            Select Certificate
                          </Button>
                          <input
                            ref={certificateFileRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleCertificateImageUpload}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700" onClick={handleUpload}>
                      Upload image
                    </Button>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700" onClick={issueCerti}>
                      Issue Certificate as NFT
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="bg-white/10 backdrop-blur-md border-purple-400/30 h-full">
                <CardHeader>
                  <CardTitle className="text-white">Issued Certificates</CardTitle>
                </CardHeader>
                <CardContent>
                  {issuedCertificates.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-purple-200">No certificates issued yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                      {issuedCertificates.map((cert, index) => (
                        <motion.div
                          key={cert.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <Card className="bg-white/5 border-purple-400/20">
                            <CardContent className="p-4">
                              <div className="flex items-start space-x-3">
                                <div className="h-10 w-10 rounded-full bg-purple-700 flex items-center justify-center flex-shrink-0">
                                  {cert.type === "course" ? (
                                    <Award className="h-5 w-5 text-white" />
                                  ) : (
                                    <Briefcase className="h-5 w-5 text-white" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-white truncate">{cert.name}</h4>
                                  <p className="text-sm text-purple-300 truncate">
                                    To: {cert.recipientAddress.substring(0, 6)}...{cert.recipientAddress.substring(38)}
                                  </p>
                                  <p className="text-xs text-purple-400 mt-1">
                                    {new Date(cert.date).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

