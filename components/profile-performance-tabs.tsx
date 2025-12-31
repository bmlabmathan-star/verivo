"use client"

import { useState, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Target, Activity } from "lucide-react"

interface Prediction {
    id: string
    outcome: 'Correct' | 'Incorrect' | 'Pending' | null
    evaluation_time: string
    // other fields...
}

interface ProfilePerformanceTabsProps {
    predictions: Prediction[]
}

export function ProfilePerformanceTabs({ predictions }: ProfilePerformanceTabsProps) {
    // Filter only evaluated predictions
    const evaluatedPredictions = useMemo(() =>
        predictions.filter(p => p.outcome === 'Correct' || p.outcome === 'Incorrect'),
        [predictions])

    const calculateStats = (days: number | 'all') => {
        const now = new Date()
        const recent = evaluatedPredictions.filter(p => {
            if (days === 'all') return true
            const pDate = new Date(p.evaluation_time)
            const diffTime = Math.abs(now.getTime() - pDate.getTime())
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            return diffDays <= days
        })

        const total = recent.length
        const correct = recent.filter(p => p.outcome === 'Correct').length
        const accuracy = total > 0 ? (correct / total) * 100 : 0

        return { total, accuracy }
    }

    const stats = {
        today: calculateStats(1),
        week: calculateStats(7),
        month: calculateStats(30),
        all: calculateStats('all')
    }

    return (
        <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-white/5 border border-white/10">
                <TabsTrigger value="today">Today</TabsTrigger>
                <TabsTrigger value="week">7 Days</TabsTrigger>
                <TabsTrigger value="month">30 Days</TabsTrigger>
                <TabsTrigger value="all">All Time</TabsTrigger>
            </TabsList>

            {Object.entries(stats).map(([key, data]) => (
                <TabsContent key={key} value={key} className="mt-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Card className="bg-white/5 border-white/10">
                            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                                <div className="flex items-center gap-2 mb-2 text-gray-400 text-xs font-bold uppercase tracking-widest">
                                    <Target className="w-3 h-3 text-purple-400" /> Accuracy
                                </div>
                                <div className="text-3xl font-black text-white">
                                    {data.total > 0 ? `${data.accuracy.toFixed(1)}%` : '-%'}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-white/5 border-white/10">
                            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                                <div className="flex items-center gap-2 mb-2 text-gray-400 text-xs font-bold uppercase tracking-widest">
                                    <Activity className="w-3 h-3 text-blue-400" /> Predictions
                                </div>
                                <div className="text-3xl font-black text-white">
                                    {data.total}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            ))}
        </Tabs>
    )
}
