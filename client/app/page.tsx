"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ethers } from "ethers"
import { Sparkles, BadgeIcon as Certificate, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"

export default function LoginPage() {
  const router = useRouter()
  const [isConnecting, setIsConnecting] = useState(false)
  const [userType, setUserType] = useState<"issuer" | "user" | null>(null)
  const [walletAddress, setWalletAddress] = useState("")

  const connectWallet = async (type: "issuer" | "user") => {
    setIsConnecting(true)
    setUserType(type)

    try {
      if (typeof window.ethereum === "undefined") {
        toast({
          title: "MetaMask not detected",
          description: "Please install MetaMask to use this application",
          variant: "destructive",
        })
        setIsConnecting(false)
        return
      }

      const provider = new ethers.BrowserProvider(window.ethereum)
      await provider.send("eth_requestAccounts", [])
      const signer = await provider.getSigner()
      const address = await signer.getAddress()
      setWalletAddress(address)

      localStorage.setItem("walletAddress", address)
      localStorage.setItem("userType", type)

      // Redirect to appropriate page
      router.push(`/${type}`)
    } catch (error) {
      console.error("Error connecting wallet:", error)
      toast({
        title: "Connection Failed",
        description: "Failed to connect to MetaMask. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-violet-800 to-indigo-900 flex flex-col items-center justify-center p-4">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 flex items-center justify-center">
          CertChain <Sparkles className="ml-2 h-8 w-8 text-yellow-300" />
        </h1>
        <p className="text-xl text-purple-200 max-w-2xl">
          Secure certificate issuance and verification platform powered by blockchain technology
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          whileHover={{ scale: 1.03 }}
          className="w-full"
        >
          <Card className="w-full h-full bg-white/10 backdrop-blur-md border-purple-400/30 overflow-hidden">
            <CardContent className="p-8 flex flex-col items-center">
              <div className="h-24 w-24 rounded-full bg-purple-600 flex items-center justify-center mb-6">
                <Certificate className="h-12 w-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Certificate Issuer</h2>
              <p className="text-purple-200 mb-8 text-center">
                Issue verifiable certificates and company credentials as NFTs
              </p>
              <Button
                size="lg"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                onClick={() => connectWallet("issuer")}
                disabled={isConnecting}
              >
                {isConnecting && userType === "issuer" ? "Connecting..." : "Connect as Issuer"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          whileHover={{ scale: 1.03 }}
          className="w-full"
        >
          <Card className="w-full h-full bg-white/10 backdrop-blur-md border-purple-400/30 overflow-hidden">
            <CardContent className="p-8 flex flex-col items-center">
              <div className="h-24 w-24 rounded-full bg-indigo-600 flex items-center justify-center mb-6">
                <Briefcase className="h-12 w-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Certificate User</h2>
              <p className="text-purple-200 mb-8 text-center">
                Collect and manage your certificates and generate verified resumes
              </p>
              <Button
                size="lg"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={() => connectWallet("user")}
                disabled={isConnecting}
              >
                {isConnecting && userType === "user" ? "Connecting..." : "Connect as User"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mt-12 text-center text-purple-200"
      >
        <p>Connect your MetaMask wallet to get started</p>
        <p className="text-sm mt-2 text-purple-300">Secure • Verifiable • Blockchain-powered</p>
      </motion.div>
    </div>
  )
}

