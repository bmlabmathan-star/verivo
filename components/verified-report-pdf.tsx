"use client"

/* eslint-disable jsx-a11y/alt-text */
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

// Create styles
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 40,
        fontFamily: 'Helvetica',
    },
    header: {
        marginBottom: 30,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        paddingBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    brand: {
        flexDirection: 'column',
    },
    brandTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0F172A',
        marginBottom: 4,
    },
    brandSubtitle: {
        fontSize: 10,
        color: '#64748B',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    meta: {
        textAlign: 'right',
    },
    metaText: {
        fontSize: 9,
        color: '#94A3B8',
        marginBottom: 2,
    },
    reportTitle: {
        fontSize: 18,
        color: '#1E293B',
        marginBottom: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    expertSection: {
        backgroundColor: '#F8FAFC',
        padding: 15,
        borderRadius: 8,
        marginBottom: 30,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    expertLabel: {
        fontSize: 10,
        color: '#64748B',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    expertName: {
        fontSize: 16,
        color: '#0F172A',
        fontWeight: 'bold',
    },
    metricsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 10,
    },
    metricCard: {
        width: '48%', // Approx 2 columns
        backgroundColor: '#FFFFFF', // White cards on white bg? No, maybe simpler
        padding: 15,
        marginBottom: 15,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    metricLabel: {
        fontSize: 10,
        color: '#64748B',
        textTransform: 'uppercase',
        marginBottom: 8,
        fontWeight: 'bold',
    },
    metricValue: {
        fontSize: 24,
        color: '#0F172A',
        fontWeight: 'bold',
    },
    verivoScoreValue: {
        color: '#7C3AED', // Purple
    },
    footer: {
        position: 'absolute',
        bottom: 40,
        left: 40,
        right: 40,
        textAlign: 'center',
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        paddingTop: 15,
    },
    footerText: {
        fontSize: 9,
        color: '#94A3B8',
    },
    verificationId: {
        fontSize: 8,
        color: '#CBD5E1',
        marginTop: 5,
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
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.brand}>
                        <Text style={styles.brandTitle}>Verivo</Text>
                        <Text style={styles.brandSubtitle}>Credibility Protocol</Text>
                    </View>
                    <View style={styles.meta}>
                        <Text style={styles.metaText}>{new Date(data.generatedAt).toLocaleDateString()}</Text>
                        <Text style={styles.metaText}>{new Date(data.generatedAt).toLocaleTimeString()}</Text>
                    </View>
                </View>

                <Text style={styles.reportTitle}>Verified Performance Report</Text>

                {/* Expert Info */}
                <View style={styles.expertSection}>
                    <Text style={styles.expertLabel}>Verified Expert</Text>
                    <Text style={styles.expertName}>{data.expertName || "Anonymous Expert"}</Text>
                </View>

                {/* Metrics */}
                <View style={styles.metricsGrid}>
                    {/* Verivo Score */}
                    <View style={[styles.metricCard, { borderColor: '#DDD6FE', backgroundColor: '#F5F3FF' }]}>
                        <Text style={[styles.metricLabel, { color: '#7C3AED' }]}>Verivo Score</Text>
                        <Text style={[styles.metricValue, styles.verivoScoreValue]}>
                            {data.verivoScore.toFixed(2)}
                        </Text>
                    </View>

                    {/* Credible Accuracy */}
                    <View style={styles.metricCard}>
                        <Text style={styles.metricLabel}>Credible Accuracy</Text>
                        <Text style={styles.metricValue}>
                            {data.credibleAccuracy.toFixed(1)}%
                        </Text>
                    </View>

                    {/* Confidence Factor */}
                    <View style={styles.metricCard}>
                        <Text style={styles.metricLabel}>Confidence Factor</Text>
                        <Text style={styles.metricValue}>
                            {data.confidenceFactor.toFixed(2)}
                        </Text>
                    </View>

                    {/* Total Predictions */}
                    <View style={styles.metricCard}>
                        <Text style={styles.metricLabel}>Total Forecasts</Text>
                        <Text style={styles.metricValue}>
                            {data.totalPredictions}
                        </Text>
                    </View>

                    {/* Correct Predictions */}
                    <View style={styles.metricCard}>
                        <Text style={styles.metricLabel}>Correct Forecasts</Text>
                        <Text style={styles.metricValue}>
                            {data.correctPredictions}
                        </Text>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        This report is digitally generated and verified by Verivo.
                    </Text>
                    <Text style={styles.verificationId}>
                        ID: {data.reportId}
                    </Text>
                </View>
            </Page>
        </Document>
    )
}
