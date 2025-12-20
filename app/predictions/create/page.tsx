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

    const [formData, setFormData] = useState({
        title: "",
        category: "",
        region: "",
        direction: "",
        target_date: "",
    })

    // Predefined options
    const categories = ["Crypto", "Stocks", "Forex", "Sports", "Politics", "Economy"]
    const regions = ["Global", "US", "EU", "Asia", "LatAm", "Africa"]
    const directions = ["Yes", "No", "Above", "Below"]

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

            // 2. Validate form
            if (!formData.title || !formData.category || !formData.region || !formData.direction || !formData.target_date) {
                throw new Error("Please fill in all fields")
            }

            // 3. Insert into Supabase
            const { error: insertError } = await supabase
                .from('predictions')
                .insert({
                    user_id: user.id,
                    title: formData.title,
                    category: formData.category,
                    region: formData.region,
                    direction: formData.direction,
                    target_date: formData.target_date,
                    // is_locked defaults to true in DB
                })

            if (insertError) throw insertError

            // 4. Redirect to dashboard
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
                        Share your expert foresight with the world. All predictions start as locked.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Title */}
                        <div className="space-y-2">
                            <Label htmlFor="title" className="text-gray-300">Prediction Title</Label>
                            <Input
                                id="title"
                                placeholder="e.g. Bitcoin will hit $100k by Q4"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Category */}
                            <div className="space-y-2">
                                <Label htmlFor="category" className="text-gray-300">Category</Label>
                                <Select
                                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                                    required
                                >
                                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((c) => (
                                            <SelectItem key={c} value={c}>{c}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Region */}
                            <div className="space-y-2">
                                <Label htmlFor="region" className="text-gray-300">Region</Label>
                                <Select
                                    onValueChange={(value) => setFormData({ ...formData, region: value })}
                                    required
                                >
                                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                        <SelectValue placeholder="Select region" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {regions.map((r) => (
                                            <SelectItem key={r} value={r}>{r}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Direction */}
                            <div className="space-y-2">
                                <Label htmlFor="direction" className="text-gray-300">Position / Direction</Label>
                                <Select
                                    onValueChange={(value) => setFormData({ ...formData, direction: value })}
                                    required
                                >
                                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                        <SelectValue placeholder="Select direction" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {directions.map((d) => (
                                            <SelectItem key={d} value={d}>{d}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Target Date */}
                            <div className="space-y-2">
                                <Label htmlFor="target_date" className="text-gray-300">Target Date</Label>
                                <div className="relative">
                                    <Input
                                        id="target_date"
                                        type="date"
                                        value={formData.target_date}
                                        onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                                        className="bg-white/5 border-white/10 text-white color-scheme-dark"
                                        required
                                    />
                                    <CalendarIcon className="absolute right-3 top-2.5 h-4 w-4 text-gray-500 pointer-events-none" />
                                </div>
                            </div>
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
                                disabled={loading}
                            >
                                {loading ? "Creating..." : "Create Prediction"}
                            </Button>
                            <p className="text-center text-xs text-gray-500 mt-4">
                                Predictions cannot be edited or deleted once created.
                            </p>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
