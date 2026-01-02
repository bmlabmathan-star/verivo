"use client"

/* eslint-disable jsx-a11y/alt-text */
import { Document, Page, Text, View, StyleSheet, Font, Svg, Polyline, Rect, Path, G, Circle } from '@react-pdf/renderer'

// Define premium styles
const styles = StyleSheet.create({
    page: {
        backgroundColor: '#FFFFFF',
        fontFamily: 'Helvetica',
        padding: 0,
        flexDirection: 'column',
    },
    // Premium Header
    header: {
        backgroundColor: '#4C1D95', // Verivo Purple (Violet 900)
        padding: '30 40',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    logoText: {
        color: '#FFFFFF',
        fontSize: 28,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    tagline: {
        color: '#E9D5FF', // Violet 200
        fontSize: 10,
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    // Content Container
    container: {
        padding: 40,
        flex: 1,
    },
    // Title Section
    titleSection: {
        marginBottom: 30,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    reportTitle: {
        fontSize: 12,
        color: '#64748B', // Slate 500
        textTransform: 'uppercase',
        marginBottom: 8,
        letterSpacing: 1,
        fontWeight: 'bold',
    },
    expertName: {
        fontSize: 24,
        color: '#0F172A', // Slate 900
        fontWeight: 'bold',
        marginBottom: 4,
    },
    dateText: {
        fontSize: 10,
        color: '#94A3B8',
    },
    // Verified Badge
    badge: {
        backgroundColor: '#DCFCE7', // Green 100
        padding: '6 10',
        borderRadius: 4,
    },
    badgeText: {
        color: '#166534', // Green 800
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    // Hero Score Card
    heroCard: {
        backgroundColor: '#F5F3FF', // Violet 50
        borderRadius: 12,
        padding: 30,
        marginBottom: 30,
        borderWidth: 1,
        borderColor: '#DDD6FE', // Violet 200
        alignItems: 'center',
    },
    heroLabel: {
        fontSize: 12,
        color: '#7C3AED', // Violet 600
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: 10,
        fontWeight: 'bold',
    },
    heroScore: {
        fontSize: 64,
        color: '#5B21B6', // Violet 800
        fontWeight: 'bold',
    },
    heroSubtext: {
        fontSize: 10,
        color: '#8B5CF6',
        marginTop: 5,
    },
    // Metrics Grid
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 15,
    },
    metricCard: {
        width: '48%',
        backgroundColor: '#F8FAFC', // Slate 50
        padding: 20,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginBottom: 15,
    },
    metricLabel: {
        fontSize: 9,
        color: '#64748B',
        textTransform: 'uppercase',
        marginBottom: 5,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    metricValue: {
        fontSize: 20,
        color: '#0F172A',
        fontWeight: 'bold',
    },
    // Footer
    footer: {
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        padding: '20 40',
        backgroundColor: '#F8FAFC',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    footerBrand: {
        fontSize: 10,
        color: '#0F172A',
        fontWeight: 'bold',
        marginBottom: 2,
    },
    footerLink: {
        fontSize: 9,
        color: '#64748B',
    },
    footerHash: {
        fontSize: 8,
        color: '#94A3B8',
        fontFamily: 'Courier',
    },
});

export interface VerifiedReportData {
    todayStats?: {
        date: string
        total: number
        correct: number
        accuracy: number
        status: 'Positive' | 'Neutral' | 'Negative'
    }
    history: {
        date: string
        accuracy: number
        total: number
        correct: number
    }[]
    reportId: string
    generatedAt: string
    expertName: string | null
    displayName?: string | null
    username?: string | null
    contributorId?: string
    verivoScore: number
    credibleAccuracy: number
    confidenceFactor: number
    totalPredictions: number
    correctPredictions: number
}

// Chart Helpers
const ChartGrid = ({ width, height, lines = 5 }: { width: number, height: number, lines?: number }) => {
    return (
        <View style={{ position: 'absolute', width, height }}>
            {Array.from({ length: lines + 1 }).map((_, i) => (
                <View
                    key={i}
                    style={{
                        position: 'absolute',
                        top: (height / lines) * i,
                        width: '100%',
                        height: 1,
                        backgroundColor: '#E2E8F0'
                    }}
                />
            ))}
        </View>
    )
}

const LineChart = ({ data, width, height }: { data: { date: string, accuracy: number }[], width: number, height: number }) => {
    if (!data || data.length < 2) return null;

    // Normalize data
    const maxVal = 100;
    const minVal = 0;
    const padding = 10;

    // Points
    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((d.accuracy - minVal) / (maxVal - minVal)) * height;
        return `${x},${y}`;
    }).join(' ');

    return (
        <View style={{ width, height, position: 'relative' }}>
            <ChartGrid width={width} height={height} lines={4} />
            <View style={{ position: 'absolute', top: 0, left: 0 }}>
                <Text style={{ fontSize: 6, color: '#94A3B8', position: 'absolute', top: -8, left: -15 }}>100%</Text>
                <Text style={{ fontSize: 6, color: '#94A3B8', position: 'absolute', top: height / 2 - 4, left: -15 }}>50%</Text>
                <Text style={{ fontSize: 6, color: '#94A3B8', position: 'absolute', top: height - 4, left: -15 }}>0%</Text>
            </View>
            <Svg height={height} width={width} viewBox={`0 0 ${width} ${height}`}>
                <Polyline
                    points={points}
                    stroke="#7C3AED"
                    strokeWidth={2}
                    fill="none"
                />
            </Svg>
            {/* Dates (Start/End) */}
            <Text style={{ fontSize: 6, color: '#94A3B8', position: 'absolute', bottom: -10, left: 0 }}>
                {new Date(data[0].date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </Text>
            <Text style={{ fontSize: 6, color: '#94A3B8', position: 'absolute', bottom: -10, right: 0 }}>
                {new Date(data[data.length - 1].date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </Text>
        </View>
    )
}

const BarChart = ({ data, width, height }: { data: { date: string, total: number, correct: number }[], width: number, height: number }) => {
    if (!data || data.length === 0) return null;

    const maxVal = Math.max(...data.map(d => d.total)) || 5; // Avoid div by 0
    const barWidth = (width / data.length) * 0.6;
    const gap = (width / data.length) * 0.4;

    return (
        <View style={{ width, height, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <ChartGrid width={width} height={height} lines={4} />
            {data.map((d, i) => {
                const totalHeight = (d.total / maxVal) * height;
                const correctHeight = (d.correct / maxVal) * height;

                return (
                    <View key={i} style={{ width: barWidth, height: '100%', justifyContent: 'flex-end', position: 'relative' }}>
                        {/* Total Bar (Background) */}
                        <View style={{
                            height: totalHeight,
                            width: '100%',
                            backgroundColor: '#E2E8F0',
                            position: 'absolute',
                            bottom: 0,
                            borderTopLeftRadius: 2,
                            borderTopRightRadius: 2
                        }} />
                        {/* Correct Bar (Foreground) */}
                        <View style={{
                            height: correctHeight,
                            width: '100%',
                            backgroundColor: '#10B981',
                            position: 'absolute',
                            bottom: 0,
                            borderTopLeftRadius: 2,
                            borderTopRightRadius: 2
                        }} />
                    </View>
                )
            })}
        </View>
    )
}

export const VerifiedReportPDF = ({ data }: { data: VerifiedReportData }) => {
    return (
        <Document>
            <Page size="A4" style={styles.page}>

                {/* Top Header Bar */}
                <View style={styles.header}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {/* Logo Icon - Flattened for PDF compatibility */}
                        <Svg width="32" height="32" viewBox="0 0 40 40">
                            <Path
                                d="M20 38C20 38 4 28 4 14V8L20 2L36 8V14C36 28 20 38 20 38Z"
                                stroke="#FFFFFF"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                fill="none"
                            />
                            <Path
                                d="M13 18L18 23L27 13"
                                stroke="#FFFFFF"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </Svg>
                        <Text style={{
                            color: '#FFFFFF',
                            fontSize: 28,
                            fontWeight: 'bold',
                            letterSpacing: 1,
                            marginLeft: 10
                        }}>
                            Verivo
                        </Text>
                    </View>
                    <Text style={styles.tagline}>Trust the data, not the hype.</Text>
                </View>

                <View style={styles.container}>

                    {/* User / Title Section */}
                    <View style={styles.titleSection}>
                        <View>
                            <Text style={styles.reportTitle}>Verified Performance Report</Text>
                            <Text style={styles.expertName}>
                                {data.displayName || data.expertName || "Verified Expert"}
                            </Text>
                            {data.username && (
                                <Text style={{ fontSize: 13, color: '#7C3AED', marginBottom: 2, fontWeight: 'medium' }}>
                                    @{data.username}
                                </Text>
                            )}
                            <Text style={styles.dateText}>
                                Generated on {new Date(data.generatedAt).toLocaleDateString()}
                            </Text>
                        </View>

                        {/* Seal Badge - Simplified paths (removed G transform) */}
                        <View style={{ alignItems: 'center' }}>
                            <Svg width="50" height="50" viewBox="0 0 100 100">
                                <Circle cx="50" cy="50" r="48" stroke="#10B981" strokeWidth="2" fill="#F0FDF4" />
                                <Circle cx="50" cy="50" r="40" stroke="#10B981" strokeWidth="1" strokeDasharray="4 2" fill="none" />
                                {/* Translated Paths (+30, +30) to avoid G transform issues */}
                                <Path
                                    d="M50 68C50 68 34 58 34 44V38L50 32L66 38V44C66 58 50 68 50 68Z"
                                    stroke="#10B981"
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    fill="none"
                                />
                                <Path
                                    d="M43 48L48 53L57 43"
                                    stroke="#10B981"
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </Svg>
                            <Text style={{ fontSize: 8, color: '#166534', fontWeight: 'bold', marginTop: 4, textTransform: 'uppercase' }}>Verified</Text>
                        </View>
                    </View>

                    {/* Today's Performance Section */}
                    {data.todayStats && (
                        <View style={{
                            marginBottom: 20,
                            padding: 15,
                            backgroundColor: '#F8FAFC',
                            borderRadius: 8,
                            borderLeftWidth: 4,
                            borderLeftColor: data.todayStats.status === 'Positive' ? '#10B981' : data.todayStats.status === 'Negative' ? '#EF4444' : '#64748B'
                        }}>
                            <Text style={styles.metricLabel}>Today's Performance ({new Date(data.todayStats.date).toLocaleDateString()})</Text>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                                <View>
                                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#0F172A' }}>{data.todayStats.total}</Text>
                                    <Text style={{ fontSize: 8, color: '#64748B' }}>FORECASTS</Text>
                                </View>
                                <View>
                                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#0F172A' }}>{data.todayStats.correct}</Text>
                                    <Text style={{ fontSize: 8, color: '#64748B' }}>CORRECT</Text>
                                </View>
                                <View>
                                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#7C3AED' }}>{data.todayStats.accuracy.toFixed(1)}%</Text>
                                    <Text style={{ fontSize: 8, color: '#64748B' }}>ACCURACY</Text>
                                </View>
                                <View style={{ justifyContent: 'center' }}>
                                    <View style={{
                                        padding: '4 8',
                                        borderRadius: 4,
                                        backgroundColor: data.todayStats.status === 'Positive' ? '#DCFCE7' : data.todayStats.status === 'Negative' ? '#FEE2E2' : '#F1F5F9'
                                    }}>
                                        <Text style={{
                                            fontSize: 9,
                                            fontWeight: 'bold',
                                            color: data.todayStats.status === 'Positive' ? '#166534' : data.todayStats.status === 'Negative' ? '#991B1B' : '#475569'
                                        }}>
                                            {data.todayStats.status.toUpperCase()} MOMENTUM
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Hero: Verivo Score */}
                    <View style={styles.heroCard}>
                        <Text style={styles.heroLabel}>Verivo Credibility Score</Text>
                        <Text style={styles.heroScore}>{data.verivoScore.toFixed(2)}</Text>
                        <Text style={styles.heroSubtext}>Updated continuously based on verified forecasts.</Text>
                    </View>

                    {/* Visualizations Section */}
                    {data.history && data.history.length > 0 && (
                        <View style={{ marginBottom: 30, flexDirection: 'row', gap: 20 }}>
                            {/* Accuracy Chart */}
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.metricLabel, { marginBottom: 15 }]}>Accuracy Trend (Last 30 Days)</Text>
                                <LineChart data={data.history.slice(-30).map(h => ({ date: h.date, accuracy: h.accuracy }))} width={220} height={100} />
                            </View>

                            {/* Volume Chart */}
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.metricLabel, { marginBottom: 15 }]}>Volume & Consistency</Text>
                                <BarChart data={data.history.slice(-14)} width={220} height={100} />
                            </View>
                        </View>
                    )}

                    {/* Secondary Metrics Grid */}
                    <View style={styles.grid}>
                        {/* Credible Accuracy */}
                        <View style={styles.metricCard}>
                            <Text style={styles.metricLabel}>Credible Accuracy</Text>
                            <Text style={styles.metricValue}>{data.credibleAccuracy.toFixed(1)}%</Text>
                        </View>

                        {/* Confidence Factor */}
                        <View style={styles.metricCard}>
                            <Text style={styles.metricLabel}>Confidence Factor</Text>
                            <Text style={styles.metricValue}>{data.confidenceFactor.toFixed(2)}</Text>
                        </View>

                        {/* Total Forecasts */}
                        <View style={styles.metricCard}>
                            <Text style={styles.metricLabel}>Total Forecasts</Text>
                            <Text style={styles.metricValue}>{data.totalPredictions}</Text>
                        </View>

                        {/* Correct Forecasts */}
                        <View style={styles.metricCard}>
                            <Text style={styles.metricLabel}>Correct Forecasts</Text>
                            <Text style={styles.metricValue}>{data.correctPredictions}</Text>
                        </View>
                    </View>

                    {/* Methodology Section */}
                    <View style={{ marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#E2E8F0' }}>
                        <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#0F172A', marginBottom: 5 }}>METHODOLOGY</Text>
                        <Text style={{ fontSize: 8, color: '#64748B', lineHeight: 1.5 }}>
                            This report represents a snapshot of performance based on verified immutable data.
                            Verivo Score is calculated using a difficulty-weighted algorithm where longer timeframes carry more weight.
                            Predictions are locked at creation and cannot be edited. "Credible Accuracy" refers to the user's weighted accuracy across all valid completed forecasts.
                            "Confidence Factor" indicates the average weight of successful predictions.
                        </Text>
                    </View>

                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <View>
                        <Text style={styles.footerBrand}>VERIVO CREDIBILITY PROTOCOL</Text>
                        <Text style={styles.footerLink}>Verify report at https://verivo.app/verify-report</Text>
                        {data.contributorId && (
                            <Text style={{ fontSize: 7, color: '#CBD5E1', marginTop: 2, fontFamily: 'Courier' }}>
                                Contributor ID: {data.contributorId}
                            </Text>
                        )}
                    </View>
                    <Text style={styles.footerHash}>ID: {data.reportId}</Text>
                </View>

            </Page>
        </Document>
    )
}
