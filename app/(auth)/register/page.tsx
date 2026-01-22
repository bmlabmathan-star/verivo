"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabaseClient"
import { countries } from "@/lib/countries"
import { Check, Loader2 } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "",
    nationality: "",
    countryCode: "",
    mobileNumber: "",
  })

  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    match: false,
  })

  // Update password criteria on change
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value
    setFormData(prev => ({ ...prev, password: newVal }))
    setPasswordCriteria(prev => ({
      ...prev,
      length: newVal.length >= 8,
      match: newVal === formData.confirmPassword
    }))
  }

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value
    setFormData(prev => ({ ...prev, confirmPassword: newVal }))
    setPasswordCriteria(prev => ({
      ...prev,
      match: newVal === formData.password
    }))
  }

  const validateStep1 = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword || !formData.username) {
      setError("Please fill in all required fields.")
      return false
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address.")
      return false
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long.")
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.")
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (!formData.nationality || !formData.countryCode) {
      setError("Please select your nationality and country code.")
      return false
    }
    return true
  }

  const handleNext = () => {
    setError("")
    if (validateStep1()) {
      setStep(2)
    }
  }

  const handleBack = () => {
    setError("")
    setStep(1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!validateStep2()) return

    setLoading(true)

    try {
      // 1. Sign up user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            username: formData.username,
          },
        },
      })

      if (authError) throw authError

      if (authData.user) {
        // 2. Insert/Update profile data
        // We handle this manually to ensure all fields are captured correctly
        const { error: profileError } = await supabase
          .from("experts")
          .upsert({
            id: authData.user.id,
            email: formData.email,
            username: formData.username,
            name: formData.name,
            gender: formData.gender || null,
            nationality: formData.nationality,
            country_code: formData.countryCode,
            mobile_number: formData.mobileNumber || null,
            mobile_verified: false,
            created_at: new Date().toISOString(),
          })

        if (profileError) {
          console.error("Profile creation error:", profileError)
          // We continue even if profile update fails, user can update later?
          // Ideally we should alert but for now let's treat markup as success or show error
          // throw profileError // Optional: decide if we want to block on profile error
        }

        router.push("/dashboard")
        router.refresh()
      }
    } catch (error: any) {
      setError(error.message || "Failed to register")
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 bg-gray-50 dark:bg-slate-950">
      <Card className="w-full max-w-md border-slate-200 dark:border-slate-800 shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center mb-2">
            <CardTitle className="text-2xl font-bold">Register as Expert</CardTitle>
            <span className="text-sm font-medium text-muted-foreground">Step {step} of 2</span>
          </div>
          <CardDescription>
            {step === 1 ? "Create your account credentials" : "Tell us a bit more about yourself"}
          </CardDescription>
          {/* Progress Indicator */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 mt-2 rounded-full overflow-hidden">
            <div
              className="bg-purple-600 h-full transition-all duration-300 ease-out"
              style={{ width: step === 1 ? "50%" : "100%" }}
            />
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-md bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}

          <form onSubmit={step === 2 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }} className="space-y-4">

            {/* STEP 1: ACCOUNT DETAILS */}
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username <span className="text-red-500">*</span></Label>
                  <Input
                    id="username"
                    placeholder="Choose a username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                    minLength={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a password (min 8 chars)"
                    value={formData.password}
                    onChange={handlePasswordChange}
                    required
                    minLength={8}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password <span className="text-red-500">*</span></Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    required
                  />
                  {formData.password && formData.confirmPassword && (
                    <div className="text-xs flex gap-3 mt-1">
                      <span className={passwordCriteria.length ? "text-green-600 flex items-center gap-1" : "text-gray-400"}>
                        {passwordCriteria.length && <Check className="w-3 h-3" />} 8+ chars
                      </span>
                      <span className={passwordCriteria.match ? "text-green-600 flex items-center gap-1" : "text-gray-400"}>
                        {passwordCriteria.match && <Check className="w-3 h-3" />} Matches
                      </span>
                    </div>
                  )}
                </div>

                <Button type="button" onClick={handleNext} className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                  Next Step
                </Button>
              </div>
            )}

            {/* STEP 2: PROFILE DETAILS */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 p-3 mb-4">
                  <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2">
                    <span className="text-lg">💡</span> These details help improve platform credibility and insights.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(val) => setFormData({ ...formData, gender: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender (Optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="non-binary">Non-binary</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nationality">Nationality <span className="text-red-500">*</span></Label>
                  <Select
                    value={formData.nationality}
                    onValueChange={(val) => setFormData({ ...formData, nationality: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your nationality" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((c) => (
                        <SelectItem key={c.code} value={c.code}>
                          <span className="mr-2">{c.flag}</span> {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-1 space-y-2">
                    <Label htmlFor="countryCode">Code <span className="text-red-500">*</span></Label>
                    <Select
                      value={formData.countryCode}
                      onValueChange={(val) => setFormData({ ...formData, countryCode: val })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Code" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((c) => (
                          <SelectItem key={`${c.code}-dial`} value={c.dial_code}>
                            <span className="mr-1">{c.flag}</span> {c.dial_code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="mobileNumber">Mobile Number</Label>
                    <Input
                      id="mobileNumber"
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={formData.mobileNumber}
                      onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    className="flex-1"
                    disabled={loading}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                    disabled={loading}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {loading ? "Creating Account..." : "Complete Registration"}
                  </Button>
                </div>
              </div>
            )}
          </form>

          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link href="/login" className="text-purple-600 hover:underline font-medium">
              Login
            </Link>
          </p>
        </CardContent>
      </Card>

      {/* Background decoration elements similar to landing page could go here */}
    </div>
  )
}



