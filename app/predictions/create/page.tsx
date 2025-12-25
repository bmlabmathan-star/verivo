"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabaseClient"
import { TrendingUp, TrendingDown } from "lucide-react"

export default function CreatePredictionPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    // Structured State
    const [marketType, setMarketType] = useState<"stock" | "global" | "">("")
    const [predictionMode, setPredictionMode] = useState<"intraday" | "opening">("intraday")

    // Stock Specifics
    const [country, setCountry] = useState("")
    const [exchange, setExchange] = useState("") // Optional
    const [stockAssetType, setStockAssetType] = useState<"Stock" | "Index" | "">("")
    const [assetName, setAssetName] = useState("") // Free text

    // Global Specifics
    const [globalAsset, setGlobalAsset] = useState("")
    const [globalIdentifier, setGlobalIdentifier] = useState("") // Free text for global asset ID

    // Common
    const [direction, setDirection] = useState("")
    const [timeframe, setTimeframe] = useState("")
    const [predictionStatement, setPredictionStatement] = useState("") // Free text input

    // --- Options ---

    const marketTypes = [
        { id: "stock", label: "Stock / Index", desc: "Country specifics" },
        { id: "global", label: "Currency / Commodity / Crypto", desc: "Global assets" }
    ]

    // Priority + Other Countries Logic
    const priorityCountries = ["USA", "UK", "Germany", "France", "Austria", "China", "Canada", "Japan", "India"]

    const otherCountriesRaw = [
        "Australia", "Belgium", "Brazil", "Global / Other", "Indonesia", "Italy", "Mexico",
        "Netherlands", "Poland", "Russia", "Saudi Arabia", "South Korea", "Spain",
        "Sweden", "Switzerland", "Taiwan", "Thailand", "Turkey"
    ]

    const otherCountries = otherCountriesRaw.sort()

    // Map countries to major exchanges
    const exchangesByCountry: Record<string, string[]> = {
        "USA": ["NYSE", "NASDAQ", "AMEX", "Other"],
        "India": ["NSE", "BSE", "Other"],
        "UK": ["LSE", "Other"],
        "Japan": ["TSE", "Other"],
        "China": ["SSE", "SZSE", "HKEX", "Other"],
        "Germany": ["XETRA", "FWB", "Other"],
        "Canada": ["TSX", "TSX-V", "Other"],
        "Australia": ["ASX", "Other"],
        "Austria": ["WBAG", "Other"],
        "France": ["Euronext", "Other"],
        "Global / Other": ["Other"],
    }

    // Default exchanges if country not found in map
    const defaultExchanges = ["Other"]

    const currentExchanges = useMemo(() => {
        if (!country) return []
        return exchangesByCountry[country] || defaultExchanges
    }, [country])

    const globalAssets = ["Crypto", "Forex", "Commodities"]

    // Simplified Directions
    const directions = [
        { value: "Up", icon: TrendingUp, color: "text-green-500" },
        { value: "Down", icon: TrendingDown, color: "text-red-500" }
    ]

    const timeframes = [
        { label: "5 Minutes", value: "5m" },
        { label: "10 Minutes", value: "10m" },
        { label: "30 Minutes", value: "30m" },
        { label: "1 Hour", value: "1h" },
        { label: "3 Hours", value: "3h" },
    ]

    const calculateTargetDate = (): string => {
        const now = new Date()

        if (predictionMode === 'opening') {
            // Logic handled by backend for exact "Next Open" time or cron validation
            // We return empty string or null-like indicator to be handled
            return ""
        }

        switch (timeframe) {
            case "5m":
                return new Date(now.getTime() + 5 * 60000).toISOString()
            case "10m":
                return new Date(now.getTime() + 10 * 60000).toISOString()
            case "30m":
                return new Date(now.getTime() + 30 * 60000).toISOString()
            case "1h":
                return new Date(now.getTime() + 60 * 60000).toISOString()
            case "3h":
                return new Date(now.getTime() + 180 * 60000).toISOString()
            default:
                return ""
        }
    }

    const getGlobalPlaceholder = () => {
        switch (globalAsset) {
            case "Crypto": return "e.g. BTC, ETH, SOL"
            case "Forex": return "e.g. EUR/USD, GBP/JPY"
            case "Commodities": return "e.g. Gold, Crude Oil, Silver"
            default: return "e.g. Asset Name"
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            // 1. Get current user session for token
            const { data: { session } } = await supabase.auth.getSession()

            if (!session) {
                throw new Error("You must be logged in to create a prediction")
            }

            // 2. Validate basic inputs
            if (!marketType) throw new Error("Please select a Market Type")
            if (!direction) throw new Error("Please select a Direction")

            // Timeframe required only for Intraday
            if (predictionMode === 'intraday' && !timeframe) {
                throw new Error("Please select a Timeframe")
            }

            // 3. Prepare Data
            const finalTargetDate = calculateTargetDate()
            let finalCategory = ""
            let finalRegion = ""
            let autoTitle = ""

            const tfLabel = predictionMode === 'opening'
                ? "Opening Prediction"
                : (timeframes.find(t => t.value === timeframe)?.label || timeframe)

            if (marketType === "stock") {
                if (!country) throw new Error("Please select a Country")
                if (!stockAssetType) throw new Error("Please select Asset Type")
                if (!assetName) throw new Error("Please enter the Asset Name")

                finalCategory = "Stocks"
                finalRegion = country

                const prefix = exchange && exchange !== "Other" ? `${exchange}: ` : ""
                autoTitle = `${prefix}${assetName.toUpperCase()} - ${direction} (${tfLabel})`

            } else {
                if (!globalAsset) throw new Error("Please select an Asset Category")
                if (!globalIdentifier) throw new Error("Please enter the Asset Identifier")

                finalCategory = globalAsset
                finalRegion = "Global"

                // Format: Category: Identifier - Direction (Timeframe)
                // e.g. Crypto: BTC - Up (1 Hour)
                autoTitle = `${globalAsset}: ${globalIdentifier.toUpperCase()} - ${direction} (${tfLabel})`
            }

            const finalTitle = predictionStatement.trim() || autoTitle

            // Calculate duration in minutes for API
            let durationMins = 0
            if (predictionMode === 'opening') {
                durationMins = -1 // Indication for Opening
            } else {
                if (timeframe === '5m') durationMins = 5
                else if (timeframe === '10m') durationMins = 10
                else if (timeframe === '30m') durationMins = 30
                else if (timeframe === '1h') durationMins = 60
                else if (timeframe === '3h') durationMins = 180
            }

            // 4. Send to API Route
            const response = await fetch('/api/create-prediction', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                    title: finalTitle,
                    category: finalCategory,
                    region: finalRegion,
                    direction: direction,
                    target_date: finalTargetDate,
                    marketType,
                    globalAsset,
                    globalIdentifier,
                    timeframe: predictionMode === 'opening' ? 'opening' : timeframe,
                    duration_minutes: durationMins, // Explicitly passed
                    prediction_type: predictionMode
                })
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || "Failed to create prediction")
            }

            // 5. Redirect
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

                        {/* 2. Prediction Mode (Only for Non-Crypto) */}
                        {(marketType === "stock" || globalAsset !== "Crypto") && (
                            <div className="space-y-3 animate-in fade-in">
                                <Label className="text-gray-200 text-base">2. Prediction Mode</Label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div
                                        onClick={() => {
                                            setPredictionStatement("") // Reset statement on mode change
                                            // Directly set mode logic here or via separate state?
                                            // Let's assume we use a local var or new state if needed. 
                                            // But for now, let's just use timeframe logic trick or new state.
                                            // The simplest is to add a new state `predictionMode` at top. 
                                            // But since we are replacing this block, I must assume `predictionMode` exists or I inject logic helper.
                                            // Wait, I cannot add state hooks in this partial replace easily unless I replace the whole component start.
                                            // I will replace the whole component start in a separate step or assume I can't.
                                            // Actually, I should use `multi_replace` to add state first.
                                            // BUT, this prompt is for `replace_file_content` of the FORM BODY.
                                            // I will use `timeframe` as the proxy if I can, OR ideally I should have added state.
                                            // Let's assume I will replace the whole file to be safe and clean.
                                        }}
                                        className="cursor-pointer..."
                                    >
                                        {/* ... */}
                                    </div>
                                </div>
                            </div>
                        )}

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
