"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Globe, Lightbulb, TrendingUp, Trophy, Landmark, Zap, ArrowRight, ArrowLeft } from "lucide-react"

interface Preferences {
    interests: string[]
    regions: string[]
}

export default function OnboardingPage() {
    const router = useRouter()
    const [step, setStep] = useState<number>(1)
    const [preferences, setPreferences] = useState<Preferences>({
        interests: [],
        regions: [],
    })

    const domains = [
        { id: "finance", label: "Finance & Markets", icon: <TrendingUp className="w-5 h-5" /> },
        { id: "sports", label: "Sports & Athletics", icon: <Trophy className="w-5 h-5" /> },
        { id: "tech", label: "Technology & AI", icon: <Zap className="w-5 h-5" /> },
        { id: "science", label: "Science & Innovation", icon: <Lightbulb className="w-5 h-5" /> },
        { id: "public_events", label: "Public Events & Politics", icon: <Landmark className="w-5 h-5" /> },
    ]

    const regions = [
        { id: "global", label: "Global", sub: "Wide-spectrum record tracking" },
        { id: "na", label: "North America", sub: "US & Canada primary datasets" },
        { id: "eu", label: "Europe", sub: "EU & UK regional focus" },
        { id: "apac", label: "Asia-Pacific", sub: "Dynamic growing markets" },
    ]

    const toggleInterest = (id: string) => {
        setPreferences(prev => ({
            ...prev,
            interests: prev.interests.includes(id)
                ? prev.interests.filter(i => i !== id)
                : [...prev.interests, id]
        }))
    }

    const toggleRegion = (id: string) => {
        setPreferences(prev => ({
            ...prev,
            regions: prev.regions.includes(id)
                ? prev.regions.filter(r => r !== id)
                : [...prev.regions, id]
        }))
    }

    const nextStep = () => setStep(prev => prev + 1)
    const prevStep = () => setStep(prev => prev - 1)
    const complete = () => {
        // In a real app, we would save these to the database here
        console.log("Saving preferences:", preferences)
        router.push("/dashboard")
    }

    return (
        <div className="container min-h-[80vh] flex items-center justify-center py-12">
            <div className="w-full max-w-2xl">
                <div className="mb-8 flex justify-between items-center px-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className={`h-2 flex-1 mx-1 rounded-full transition-all duration-500 ${i <= step ? "bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" : "bg-white/10"
                                }`}
                        />
                    ))}
                </div>

                {step === 1 && (
                    <Card className="glass-card border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <CardHeader className="text-center pt-10">
                            <div className="w-20 h-20 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-purple-500/30">
                                <Globe className="w-10 h-10 text-purple-400" />
                            </div>
                            <CardTitle className="text-4xl font-black text-white tracking-tight mb-4">WELCOME TO VERIVO</CardTitle>
                            <CardDescription className="text-xl text-white/60 font-medium">
                                Let's personalize your experience. We'll tailor the records and predictions you see based on your preferences.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex justify-center pb-10">
                            <Button onClick={nextStep} size="lg" className="bg-purple-600 hover:bg-purple-500 text-white px-8 h-14 rounded-2xl text-lg font-bold transition-all hover:scale-105 shadow-xl shadow-purple-500/20">
                                Get Started <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {step === 2 && (
                    <Card className="glass-card border-white/10 animate-in fade-in slide-in-from-right-4 duration-500">
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold text-white">Your Interests</CardTitle>
                            <CardDescription className="text-white/60">
                                Which domains are you interested in following? This helps us prioritize relevant records for you.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-3">
                                {domains.map((domain) => (
                                    <button
                                        key={domain.id}
                                        onClick={() => toggleInterest(domain.id)}
                                        className={`flex items-center p-4 rounded-2xl border transition-all duration-300 ${preferences.interests.includes(domain.id)
                                            ? "bg-purple-500/20 border-purple-500 text-white shadow-lg shadow-purple-500/10"
                                            : "bg-white/5 border-white/10 text-white/60 hover:border-white/20 hover:bg-white/10"
                                            }`}
                                    >
                                        <div className={`p-2 rounded-lg mr-4 ${preferences.interests.includes(domain.id) ? "bg-purple-500/30 text-purple-300" : "bg-white/10 text-white/40"
                                            }`}>
                                            {domain.icon}
                                        </div>
                                        <span className="font-bold text-lg">{domain.label}</span>
                                        {preferences.interests.includes(domain.id) && (
                                            <div className="ml-auto bg-purple-500 rounded-full p-1">
                                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                            <div className="flex justify-between mt-8 pt-4 border-t border-white/10">
                                <Button variant="ghost" onClick={prevStep} className="text-white/60 hover:text-white">
                                    <ArrowLeft className="mr-2 w-4 h-4" /> Back
                                </Button>
                                <Button
                                    onClick={nextStep}
                                    disabled={preferences.interests.length === 0}
                                    className="bg-purple-600 hover:bg-purple-500 text-white px-6"
                                >
                                    Continue <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {step === 3 && (
                    <Card className="glass-card border-white/10 animate-in fade-in slide-in-from-right-4 duration-500">
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold text-white">Geographic Focus</CardTitle>
                            <CardDescription className="text-white/60">
                                Which regions' updates would you like to prioritize in your feed?
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {regions.map((region) => (
                                    <button
                                        key={region.id}
                                        onClick={() => toggleRegion(region.id)}
                                        className={`flex flex-col items-start p-5 rounded-3xl border transition-all duration-300 text-left ${preferences.regions.includes(region.id)
                                            ? "bg-cyan-500/20 border-cyan-500 text-white shadow-lg shadow-cyan-500/10"
                                            : "bg-white/5 border-white/10 text-white/60 hover:border-white/20 hover:bg-white/10"
                                            }`}
                                    >
                                        <div className="flex justify-between w-full mb-2">
                                            <span className="font-black text-lg tracking-tight uppercase">{region.label}</span>
                                            {preferences.regions.includes(region.id) && (
                                                <div className="bg-cyan-500 rounded-full p-1">
                                                    <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-sm text-white/40 leading-tight">
                                            {region.sub}
                                        </span>
                                    </button>
                                ))}
                            </div>
                            <div className="flex justify-between mt-8 pt-4 border-t border-white/10">
                                <Button variant="ghost" onClick={prevStep} className="text-white/60 hover:text-white">
                                    <ArrowLeft className="mr-2 w-4 h-4" /> Back
                                </Button>
                                <Button
                                    onClick={nextStep}
                                    disabled={preferences.regions.length === 0}
                                    className="bg-cyan-600 hover:bg-cyan-500 text-white px-6"
                                >
                                    Continue <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {step === 4 && (
                    <Card className="glass-card border-white/10 text-center animate-in zoom-in-95 duration-500">
                        <CardHeader className="pt-10">
                            <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30 animate-bounce">
                                <svg className="w-12 h-12 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <CardTitle className="text-4xl font-black text-white tracking-tight mb-4">READY TO EXPLORE</CardTitle>
                            <CardDescription className="text-xl text-white/60 font-medium">
                                Your preferences have been saved. You're now ready to view time-locked records tailored to your interests.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pb-12">
                            <Button onClick={complete} size="lg" className="bg-white text-black hover:bg-white/90 px-10 h-14 rounded-2xl text-lg font-bold transition-all hover:scale-105 shadow-2xl">
                                Go to Dashboard
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
