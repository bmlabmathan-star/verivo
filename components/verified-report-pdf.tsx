"use client"

/* eslint-disable jsx-a11y/alt-text */
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'

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
    reportId: string
    generatedAt: string
    expertName: string | null
    verivoScore: number
    credibleAccuracy: number
    confidenceFactor: number
    totalPredictions: number
    correctPredictions: number
}

export const VerifiedReportPDF = ({ data }: { data: VerifiedReportData }) => {
    return (
        <Document>
            <Page size="A4" style={styles.page}>

                {/* Top Header Bar */}
                <View style={styles.header}>
                    <Text style={styles.logoText}>Verivo</Text>
                    <Text style={styles.tagline}>Trust the data, not the hype.</Text>
                </View>

                <View style={styles.container}>

                    {/* User / Title Section */}
                    <View style={styles.titleSection}>
                        <View>
                            <Text style={styles.reportTitle}>Verified Performance Report</Text>
                            <Text style={styles.expertName}>{data.expertName || "Anonymous Expert"}</Text>
                            <Text style={styles.dateText}>
                                Generated on {new Date(data.generatedAt).toLocaleDateString()}
                            </Text>
                        </View>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>Verified by Verivo</Text>
                        </View>
                    </View>

                    {/* Hero: Verivo Score */}
                    <View style={styles.heroCard}>
                        <Text style={styles.heroLabel}>Verivo Credibility Score</Text>
                        <Text style={styles.heroScore}>{data.verivoScore.toFixed(2)}</Text>
                        <Text style={styles.heroSubtext}>Composite metric of accuracy & difficulty</Text>
                    </View>

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

                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <View>
                        <Text style={styles.footerBrand}>VERIVO CREDIBILITY PROTOCOL</Text>
                        <Text style={styles.footerLink}>Verify report at https://verivo.app/verify-report</Text>
                    </View>
                    <Text style={styles.footerHash}>ID: {data.reportId}</Text>
                </View>

            </Page>
        </Document>
    )
}
