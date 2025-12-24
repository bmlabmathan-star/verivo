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
            if (!timeframe) throw new Error("Please select a Timeframe")

            // 3. Prepare Data
            const finalTargetDate = calculateTargetDate()
            let finalCategory = ""
            let finalRegion = ""
            let autoTitle = ""

            const tfLabel = timeframes.find(t => t.value === timeframe)?.label || timeframe

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
            if (timeframe === '5m') durationMins = 5
            else if (timeframe === '10m') durationMins = 10
            else if (timeframe === '30m') durationMins = 30
            else if (timeframe === '1h') durationMins = 60
            else if (timeframe === '3h') durationMins = 180

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
                    timeframe,
                    duration_minutes: durationMins // Explicitly passed
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

                        {/* 1. Market Type */}
                        <div className="space-y-3">
                            <Label className="text-gray-200 text-base">1. Select Market Type</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {marketTypes.map((type) => (
                                    <div
                                        key={type.id}
                                        onClick={() => {
                                            setMarketType(type.id as "stock" | "global")
                                            setCountry("")
                                            setExchange("")
                                            setStockAssetType("")
                                            setAssetName("")
                                            setGlobalAsset("")
                                            setGlobalIdentifier("")
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

                        {/* --- STOCK / INDEX PATH --- */}
                        {marketType === "stock" && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-top-2">

                                <div className="space-y-3">
                                    <Label className="text-gray-200 text-base">2. Select Country</Label>
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
                                            {/* Priority Countries */}
                                            {priorityCountries.map(c => (
                                                <SelectItem key={c} value={c} className="font-semibold text-purple-200">{c}</SelectItem>
                                            ))}

                                            <div className="h-px bg-white/10 my-1 mx-2" />

                                            {/* Other Countries */}
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
                                        <p className="text-xs text-gray-500">
                                            Enter the common ticker symbol or full company/index name, e.g. BTC-USD, RELIANCE, SPX.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* --- GLOBAL PATH --- */}
                        {marketType === "global" && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
                                <div className="space-y-3">
                                    <Label className="text-gray-200 text-base">2. Select Global Asset Category</Label>
                                    <Select
                                        value={globalAsset}
                                        onValueChange={(val) => {
                                            setGlobalAsset(val)
                                            setGlobalIdentifier("") // Clear identifier when category changes
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
                                        <p className="text-xs text-gray-500">
                                            Enter the specific asset symbol or name (e.g. BTC, EUR-USD, Gold).
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 3. Direction (Common) */}
                        <div className="space-y-3">
                            <Label className="text-gray-200 text-base">
                                {marketType ? "3." : "2."} Position / Direction
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

                        {/* 4. Timeframe (Common) */}
                        <div className="space-y-3">
                            <Label className="text-gray-200 text-base">
                                {marketType ? "4." : "3."} Lock-in Duration
                            </Label>
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

                        {/* 5. Optional Statement */}
                        <div className="space-y-3">
                            <Label htmlFor="statement" className="text-gray-200 text-base">
                                {marketType ? "5." : "4."} Prediction Statement <span className="text-gray-500 text-sm font-normal">(Optional)</span>
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
