"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useApp } from "@/lib/contexts/app-context"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface AuthFormProps {
  type: "login" | "signup"
}

export function AuthForm({ type }: AuthFormProps) {
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [name, setName] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const { login, signup } = useApp()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (type === "login") {
        await login(email, password)
        toast.success("Login successful!")
        router.push("/")
      } else {
        if (password !== confirmPassword) {
          toast.error("Passwords do not match.")
          return
        }
        await signup(email, password, name || undefined)
        toast.success("Account created successfully!")
        router.push("/")
      }
    } catch (error: any) {
      console.error(`${type} error:`, error)
      toast.error(error.message || `${type} failed. Please try again.`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">{type === "login" ? "Login" : "Sign Up"}</CardTitle>
        <CardDescription className="text-center">
          {type === "login"
            ? "Enter your email below to login to your account."
            : "Enter your email below to create an account."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          {type === "signup" && (
            <div className="grid gap-2">
              <Label htmlFor="name">Name (Optional)</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {type === "signup" && (
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          )}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Processing..." : (type === "login" ? "Login" : "Sign Up")}
            </Button>
          </motion.div>
        </form>
        <div className="mt-4 text-center text-sm">
          {type === "login" ? (
            <>
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="underline">
                Sign up
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link href="/login" className="underline">
                Login
              </Link>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
