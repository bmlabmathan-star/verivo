"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabaseClient"
import { CalendarIcon } from "lucide-react"

export default function CreatePredictionPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    // Structured State
    const [marketType, setMarketType] = useState<"stock" | "global" | "">("")
    const [country, setCountry] = useState("")
    const [globalAsset, setGlobalAsset] = useState("")
    const [direction, setDirection] = useState("")
    const [timeframe, setTimeframe] = useState("")
    const [customDate, setCustomDate] = useState("")
    const [predictionStatement, setPredictionStatement] = useState("") // Free text (formerly title)

    // Options
    const marketTypes = [
        { id: "stock", label: "Stock / Index", desc: "Country specifics" },
        { id: "global", label: "Currency / Commodity / Crypto", desc: "Global assets" }
    ]

    const countries = [
        "Global / Other", "USA", "China", "Japan", "Germany", "India", "UK", "France", "Brazil", "Italy", "Canada",
        "South Korea", "Russia", "Australia", "Spain", "Mexico", "Indonesia", "Netherlands", "Saudi Arabia", "Turkey",
        "Switzerland", "Taiwan", "Poland", "Sweden", "Belgium", "Thailand"
    ]

    const globalAssets = ["Crypto", "Forex", "Commodities"]

    // Using existing directions as requested
    const directions = ["Yes", "No", "Above", "Below"]

    const timeframes = [
        { label: "5 Minutes", value: "5m" },
        { label: "10 Minutes", value: "10m" },
        { label: "30 Minutes", value: "30m" },
        { label: "1 Hour", value: "1h" },
        { label: "End of Day", value: "eod" },
        { label: "Custom Date", value: "custom" },
    ]

    const calculateTargetDate = (): string => {
        const now = new Date()

        switch (timeframe) {
            case "5m":
                return new Date(now.getTime() + 5 * 60000).toISOString()
            case "10m":
                return new Date(now.getTime() + 10 * 60000).toISOString()
            case "30m":
                return new Date(now.getTime() + 30 * 60000).toISOString()
            case "1h":
                return new Date(now.getTime() + 60 * 60000).toISOString()
            case "eod":
                const eod = new Date(now)
                eod.setHours(23, 59, 59, 999)
                return eod.toISOString()
            case "custom":
                return customDate ? new Date(customDate).toISOString() : ""
            default:
                return ""
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            // 1. Get current user
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                throw new Error("You must be logged in to create a prediction")
            }

            // 2. data prep
            const finalTargetDate = calculateTargetDate()
            if (!finalTargetDate) {
                throw new Error("Please select a valid timeframe target")
            }

            // Determine Category & Region based on Market Type
            let finalCategory = ""
            let finalRegion = ""

            if (marketType === "stock") {
                finalCategory = "Stocks"
                finalRegion = country || "Global"
            } else {
                finalCategory = globalAsset
                finalRegion = "Global"
            }

            if (!finalCategory) throw new Error("Please select an asset type or category")
            if (marketType === "stock" && !country) throw new Error("Please select a country")
            if (!direction) throw new Error("Please select a direction")

            // Auto-generate title if missing
            // Format: "{Asset/Country} - {Direction} ({TimeframeLabel})"
            const tfLabel = timeframes.find(t => t.value === timeframe)?.label || timeframe
            const generatedTitle = predictionStatement.trim() ||
                `${marketType === 'stock' ? country : globalAsset} - ${direction} (${tfLabel})`

            // 3. Insert into Supabase
            const { error: insertError } = await supabase
                .from('predictions')
                .insert({
                    user_id: user.id,
                    title: generatedTitle,
                    category: finalCategory,
                    region: finalRegion,
                    direction: direction,
                    target_date: finalTargetDate,
                })

            if (insertError) throw insertError

            // 4. Redirect
            router.push('/dashboard')
            router.refresh()

        } catch (err: any) {
            console.error("Error creating prediction:", err)
            setError(err.message || "Failed to create prediction")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container py-12 max-w-2xl">
            <Card className="border-white/10 glass-card">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                        Create Prediction
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                        Configure your prediction parameters.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-8">

                        {/* 1. Market Type */}
                        <div className="space-y-3">
                            <Label className="text-gray-200 text-base">1. Select Market Type</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {marketTypes.map((type) => (
                                    <div
                                        key={type.id}
                                        onClick={() => {
                                            setMarketType(type.id as "stock" | "global")
                                            // Reset dependents
                                            setCountry("")
                                            setGlobalAsset("")
                                        }}
                                        className={`cursor-pointer rounded-lg border p-4 transition-all hover:bg-white/5 ${marketType === type.id
                                                ? "border-purple-500 bg-purple-500/10"
                                                : "border-white/10"
                                            }`}
                                    >
                                        <div className="font-semibold text-white">{type.label}</div>
                                        <div className="text-xs text-gray-400">{type.desc}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 2. Conditional: Country OR Asset Type */}
                        {marketType === "stock" && (
                            <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                <Label className="text-gray-200 text-base">2. Select Country / Market</Label>
                                <Select onValueChange={setCountry} value={country}>
                                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                        <SelectValue placeholder="Select Country" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Global / Other">Global / Other</SelectItem>
                                        {countries.filter(c => c !== "Global / Other").sort().map((c) => (
                                            <SelectItem key={c} value={c}>{c}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {marketType === "global" && (
                            <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                <Label className="text-gray-200 text-base">2. Select Asset Type</Label>
                                <Select onValueChange={setGlobalAsset} value={globalAsset}>
                                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                        <SelectValue placeholder="Select Asset Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {globalAssets.map((a) => (
                                            <SelectItem key={a} value={a}>{a}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* 3. Direction */}
                        <div className="space-y-3">
                            <Label className="text-gray-200 text-base">3. Position / Direction</Label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {directions.map((d) => (
                                    <Button
                                        key={d}
                                        type="button"
                                        variant="outline"
                                        onClick={() => setDirection(d)}
                                        className={`border-white/10 ${direction === d
                                                ? "bg-purple-600 text-white border-purple-600 hover:bg-purple-700"
                                                : "bg-transparent text-gray-300 hover:bg-white/5"
                                            }`}
                                    >
                                        {d}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* 4. Timeframe */}
                        <div className="space-y-3">
                            <Label className="text-gray-200 text-base">4. Prediction Timeframe</Label>
                            <Select onValueChange={setTimeframe} value={timeframe}>
                                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                    <SelectValue placeholder="Select Duration" />
                                </SelectTrigger>
                                <SelectContent>
                                    {timeframes.map((t) => (
                                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {timeframe === "custom" && (
                                <div className="pt-2 animate-in fade-in">
                                    <Label className="text-sm text-gray-400 mb-1 block">Pick Date</Label>
                                    <div className="relative">
                                        <Input
                                            type="date"
                                            value={customDate}
                                            onChange={(e) => setCustomDate(e.target.value)}
                                            className="bg-white/5 border-white/10 text-white color-scheme-dark pl-10"
                                        />
                                        <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-500 pointer-events-none" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 5. Optional Statement */}
                        <div className="space-y-3">
                            <Label htmlFor="statement" className="text-gray-200 text-base">
                                5. Prediction Statement <span className="text-gray-500 text-sm font-normal">(Optional)</span>
                            </Label>
                            <Input
                                id="statement"
                                placeholder="e.g. BTC will breakout above resistance..."
                                value={predictionStatement}
                                onChange={(e) => setPredictionStatement(e.target.value)}
                                className="bg-white/5 border-white/10 text-white placeholder:text-gray-600"
                            />
                        </div>

                        {error && (
                            <div className="text-red-400 text-sm bg-red-500/10 p-3 rounded-md border border-red-500/20">
                                {error}
                            </div>
                        )}

                        <div className="pt-4">
                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-6 text-lg transition-all hover:scale-[1.01]"
                                disabled={loading || !marketType || !direction || !timeframe}
                            >
                                {loading ? "Creating..." : "Create Prediction"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
