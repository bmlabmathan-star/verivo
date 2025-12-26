"use client"

import { useState, useMemo, FormEvent } from "react"
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
            case "Forex": return "e.g. EUR, GBP, JPY (Base Code)"
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

            // Forex Opening Validation (08:00 UK Cutoff)
            if (globalAsset === 'Forex' && predictionMode === 'opening') {
                const now = new Date()
                const ukFmt = new Intl.DateTimeFormat('en-GB', {
                    timeZone: 'Europe/London',
                    hour: 'numeric',
                    hour12: false
                })
                const ukHour = parseInt(ukFmt.format(now))
                // Strict cutoff: 08:00 UK. If hour is 8 or more, it's too late.
                if (ukHour >= 8) {
                    throw new Error("Forex opening predictions must be placed before 08:00 UK time.")
                }
            }

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
                // Forex: EUR/USD - Up (5m)
                let displayId = globalIdentifier.toUpperCase()
                if (globalAsset === 'Forex' && !displayId.includes('/')) {
                    displayId = `${displayId}/USD`
                }

                autoTitle = `${globalAsset}: ${displayId} - ${direction} (${tfLabel})`
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
                // Handle duplicate prediction specifically
                if (result.code === 'ACTIVE_PREDICTION_EXISTS') {
                    setError("⚠️ DUPLICATE: " + (result.error || "You already have an active prediction for this asset."))
                    // We could also set a specific flag to disable button if we wanted, 
                    // but error message visibility is the main request.
                    // The error state will be shown in the UI.
                } else {
                    throw new Error(result.error || "Failed to create prediction")
                }
                return // Stop execution
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
                        {/* 1. Market Type */}
                        <div className="space-y-3">
                            <Label className="text-gray-200 text-base">1. Select Market Type</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {marketTypes.map((type) => (
                                    <div
                                        key={type.id}
                                        onClick={() => {
                                            const newType = type.id as "stock" | "global"
                                            setMarketType(newType)
                                            setCountry("")
                                            setExchange("")
                                            setStockAssetType("")
                                            setAssetName("")
                                            setGlobalAsset("")
                                            setGlobalIdentifier("")

                                            // Smart Defaults for Mode
                                            // We don't know Global Asset yet, so we default to Opening for generic Global,
                                            // BUT if user selects Crypto later, we switch.
                                            // Actually, for "Global", we wait for category?
                                            // Let's just set a safe default 'opening' for Stock, and 'intraday' for Global (assuming Crypto is popular) 
                                            // OR per instructions: "If market_type === 'crypto'..." (Crypto is a global asset sub-selection).
                                            // So we react to Global Asset change, not just Market Type.
                                            // For now, reset to Intraday as safe default or maintain existing?
                                            // Instruction: "Opening (default for equity...)"
                                            if (newType === 'stock') setPredictionMode('opening')
                                            else setPredictionMode('intraday')
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

                        {/* 2. Prediction Mode (Visible & Required) */}
                        {marketType && (
                            <div className="space-y-3 animate-in fade-in">
                                <Label className="text-gray-200 text-base">2. Prediction Mode</Label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div
                                        onClick={() => setPredictionMode("intraday")}
                                        className={`cursor-pointer rounded-lg border p-4 transition-all hover:bg-white/5 ${predictionMode === "intraday"
                                            ? "border-blue-400 bg-blue-500/10"
                                            : "border-white/10"
                                            }`}
                                    >
                                        <div className="font-semibold text-white">Instant / Intraday</div>
                                        <div className="text-xs text-gray-400">Lock in for a specific duration</div>
                                    </div>
                                    <div
                                        onClick={() => setPredictionMode("opening")}
                                        className={`cursor-pointer rounded-lg border p-4 transition-all hover:bg-white/5 ${predictionMode === "opening"
                                            ? "border-yellow-400 bg-yellow-500/10"
                                            : "border-white/10"
                                            }`}
                                    >
                                        <div className="font-semibold text-white">Opening Prediction</div>
                                        <div className="text-xs text-gray-400">Next Market Open Price</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- STOCK / INDEX PATH --- */}
                        {marketType === "stock" && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
                                <div className="space-y-3">
                                    <Label className="text-gray-200 text-base">Select Country</Label>
                                    <Select
                                        value={country}
                                        onValueChange={(val) => {
                                            setCountry(val)
                                            setExchange("")
                                        }}
                                    >
                                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                            <SelectValue placeholder="Select Country" />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-[300px]">
                                            {priorityCountries.map(c => (
                                                <SelectItem key={c} value={c} className="font-semibold text-purple-200">{c}</SelectItem>
                                            ))}
                                            <div className="h-px bg-white/10 my-1 mx-2" />
                                            {otherCountries.map(c => (
                                                <SelectItem key={c} value={c}>{c}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {country && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in">
                                        <div className="space-y-3">
                                            <Label className="text-gray-200 text-base">Exchange <span className="text-gray-500 text-xs font-normal">(Optional)</span></Label>
                                            <Select value={exchange} onValueChange={setExchange}>
                                                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                                    <SelectValue placeholder="Select Exchange" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {currentExchanges.map((ex) => (
                                                        <SelectItem key={ex} value={ex}>{ex}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-3">
                                            <Label className="text-gray-200 text-base">Asset Type</Label>
                                            <Select
                                                value={stockAssetType}
                                                onValueChange={(val) => setStockAssetType(val as "Stock" | "Index")}
                                            >
                                                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                                    <SelectValue placeholder="Select Type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Stock">Stock</SelectItem>
                                                    <SelectItem value="Index">Index</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                )}

                                {stockAssetType && (
                                    <div className="space-y-3 animate-in fade-in">
                                        <Label className="text-gray-200 text-base">Asset Name / Ticker</Label>
                                        <Input
                                            placeholder={stockAssetType === "Stock" ? "e.g. AAPL, Reliance, Tesla..." : "e.g. Nifty 50, S&P 500..."}
                                            value={assetName}
                                            onChange={(e) => setAssetName(e.target.value)}
                                            className="bg-white/5 border-white/10 text-white placeholder:text-gray-600"
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* --- GLOBAL PATH --- */}
                        {marketType === "global" && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
                                <div className="space-y-3">
                                    <Label className="text-gray-200 text-base">Select Global Asset Category</Label>
                                    <Select
                                        value={globalAsset}
                                        onValueChange={(val) => {
                                            setGlobalAsset(val)
                                            setGlobalIdentifier("")
                                            // Auto-Mode Logic
                                            if (val === "Crypto" || val === "Forex") setPredictionMode("intraday")
                                            else setPredictionMode("opening")
                                        }}
                                    >
                                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                            <SelectValue placeholder="Select Assessment Category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {globalAssets.map((a) => (
                                                <SelectItem key={a} value={a}>{a}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {globalAsset && (
                                    <div className="space-y-3 animate-in fade-in">
                                        <Label className="text-gray-200 text-base">Asset Identifier</Label>
                                        <Input
                                            placeholder={getGlobalPlaceholder()}
                                            value={globalIdentifier}
                                            onChange={(e) => setGlobalIdentifier(e.target.value)}
                                            className="bg-white/5 border-white/10 text-white placeholder:text-gray-600"
                                        />
                                        {globalAsset === "Forex" && globalIdentifier.length >= 3 && (
                                            <p className="text-xs text-blue-300/80 font-mono pl-1">
                                                Base Pair: {globalIdentifier.substring(0, 3).toUpperCase()}/USD (Reference)
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 3. Direction (Common) */}
                        <div className="space-y-3">
                            <Label className="text-gray-200 text-base">
                                Position / Direction
                            </Label>
                            <div className="grid grid-cols-2 gap-4">
                                {directions.map((d) => (
                                    <Button
                                        key={d.value}
                                        type="button"
                                        variant="outline"
                                        onClick={() => setDirection(d.value)}
                                        className={`h-24 border-white/10 flex flex-col items-center justify-center gap-2 transition-all ${direction === d.value
                                            ? `bg-white/10 border-white/30 text-white ring-1 ring-white/50 backdrop-blur-sm`
                                            : "bg-transparent text-gray-400 hover:bg-white/5 hover:text-white"
                                            }`}
                                    >
                                        <d.icon className={`h-8 w-8 ${direction === d.value ? d.color : "text-gray-500"}`} />
                                        <span className="text-xl font-medium">{d.value}</span>
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* 4. Timeframe (Only for Intraday) */}
                        {predictionMode === 'intraday' && (
                            <div className="space-y-3 animate-in fade-in">
                                <Label className="text-gray-200 text-base">Lock-in Duration</Label>
                                <Select value={timeframe} onValueChange={setTimeframe}>
                                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                        <SelectValue placeholder="Select Lock-in Duration" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {timeframes.map((t) => (
                                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Opening Mode info */}
                        {predictionMode === 'opening' && (
                            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                <p className="text-sm text-blue-200 flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4" />
                                    Prediction locked until next official market open.
                                </p>
                                {globalAsset === 'Forex' && (
                                    <p className="text-xs text-blue-300/80 mt-1 pl-6">
                                        Opening price is based on London FX session (08:00 UK time).
                                    </p>
                                )}
                            </div>
                        )}

                        {/* 5. Optional Statement */}
                        <div className="space-y-3">
                            <Label htmlFor="statement" className="text-gray-200 text-base">
                                Prediction Statement <span className="text-gray-500 text-sm font-normal">(Optional)</span>
                            </Label>
                            <Input
                                id="statement"
                                placeholder="e.g. Breakout above resistance confirmed..."
                                value={predictionStatement}
                                onChange={(e) => setPredictionStatement(e.target.value)}
                                className="bg-white/5 border-white/10 text-white placeholder:text-gray-600"
                            />
                        </div>

                        {error && (
                            <div className={`p-4 rounded-md border text-sm animate-in fade-in slide-in-from-top-2 ${error.includes('DUPLICATE') ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-200' : 'bg-red-500/10 border-red-500/20 text-red-300'}`}>
                                {error}
                            </div>
                        )}

                        <div className="pt-4">
                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-6 text-lg transition-all hover:scale-[1.01]"
                                disabled={
                                    loading ||
                                    !marketType ||
                                    !direction ||
                                    !predictionMode ||
                                    (predictionMode === 'intraday' && !timeframe) ||
                                    (marketType === 'stock' && (!country || !stockAssetType || !assetName)) ||
                                    (marketType === 'global' && (!globalAsset || !globalIdentifier))
                                }
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
