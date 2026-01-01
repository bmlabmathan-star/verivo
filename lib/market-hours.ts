export type MarketStatus = {
    isOpen: boolean
    message?: string
}

type MarketConfig = {
    tz: string
    openH: number
    openM: number
    closeH: number
    closeM: number
    name: string
    tzLabel: string
}

const MARKET_CONFIG: Record<string, MarketConfig> = {
    // US Markets
    '^NDX': { tz: 'America/New_York', openH: 9, openM: 30, closeH: 16, closeM: 0, name: 'NASDAQ', tzLabel: 'New York time' },
    '^GSPC': { tz: 'America/New_York', openH: 9, openM: 30, closeH: 16, closeM: 0, name: 'S&P 500', tzLabel: 'New York time' },
    'US': { tz: 'America/New_York', openH: 9, openM: 30, closeH: 16, closeM: 0, name: 'US Market', tzLabel: 'New York time' },

    // UK
    '^FTSE': { tz: 'Europe/London', openH: 8, openM: 0, closeH: 16, closeM: 30, name: 'London Market', tzLabel: 'London time' },

    // Germany
    '^GDAXI': { tz: 'Europe/Berlin', openH: 9, openM: 0, closeH: 17, closeM: 30, name: 'German Market', tzLabel: 'Berlin time' },

    // India
    '^NSEI': { tz: 'Asia/Kolkata', openH: 9, openM: 15, closeH: 15, closeM: 30, name: 'NIFTY', tzLabel: 'IST' },
    '^NSEBANK': { tz: 'Asia/Kolkata', openH: 9, openM: 15, closeH: 15, closeM: 30, name: 'BANK NIFTY', tzLabel: 'IST' },
    '^BSESN': { tz: 'Asia/Kolkata', openH: 9, openM: 15, closeH: 15, closeM: 30, name: 'SENSEX', tzLabel: 'IST' },

    // Japan
    '^N225': { tz: 'Asia/Tokyo', openH: 9, openM: 0, closeH: 15, closeM: 0, name: 'Nikkei 225', tzLabel: 'JST' },

    // Hong Kong
    '^HSI': { tz: 'Asia/Hong_Kong', openH: 9, openM: 30, closeH: 16, closeM: 0, name: 'Hang Seng', tzLabel: 'HKT' },

    // France
    '^FCHI': { tz: 'Europe/Paris', openH: 9, openM: 0, closeH: 17, closeM: 30, name: 'CAC 40', tzLabel: 'Paris time' },

    // USA (Dow Jones)
    '^DJI': { tz: 'America/New_York', openH: 9, openM: 30, closeH: 16, closeM: 0, name: 'Dow Jones', tzLabel: 'New York time' },

    // Spain
    '^IBEX': { tz: 'Europe/Madrid', openH: 9, openM: 0, closeH: 17, closeM: 30, name: 'IBEX 35', tzLabel: 'Madrid time' },

    // --- Exchange Mappings for Stocks ---
    'NASDAQ': { tz: 'America/New_York', openH: 9, openM: 30, closeH: 16, closeM: 0, name: 'NASDAQ', tzLabel: 'New York time' },
    'NYSE': { tz: 'America/New_York', openH: 9, openM: 30, closeH: 16, closeM: 0, name: 'NYSE', tzLabel: 'New York time' },
    'London Stock Exchange': { tz: 'Europe/London', openH: 8, openM: 0, closeH: 16, closeM: 30, name: 'London Stock Exchange', tzLabel: 'London time' },
    'Xetra': { tz: 'Europe/Berlin', openH: 9, openM: 0, closeH: 17, closeM: 30, name: 'Xetra', tzLabel: 'Berlin time' },
    'Euronext Paris': { tz: 'Europe/Paris', openH: 9, openM: 0, closeH: 17, closeM: 30, name: 'Euronext Paris', tzLabel: 'Paris time' },
    'Vienna Stock Exchange': { tz: 'Europe/Vienna', openH: 9, openM: 0, closeH: 17, closeM: 30, name: 'Vienna Stock Exchange', tzLabel: 'Vienna time' },
    'Shanghai': { tz: 'Asia/Shanghai', openH: 9, openM: 30, closeH: 15, closeM: 0, name: 'Shanghai Stock Exchange', tzLabel: 'China time' }, // Simplified (ignoring lunch break for v1)
    'Shenzhen': { tz: 'Asia/Shanghai', openH: 9, openM: 30, closeH: 15, closeM: 0, name: 'Shenzhen Stock Exchange', tzLabel: 'China time' },
    'Toronto Stock Exchange': { tz: 'America/Toronto', openH: 9, openM: 30, closeH: 16, closeM: 0, name: 'Toronto Stock Exchange', tzLabel: 'Toronto time' },
    'Tokyo Stock Exchange': { tz: 'Asia/Tokyo', openH: 9, openM: 0, closeH: 15, closeM: 0, name: 'Tokyo Stock Exchange', tzLabel: 'JST' },
    'NSE': { tz: 'Asia/Kolkata', openH: 9, openM: 15, closeH: 15, closeM: 30, name: 'NSE', tzLabel: 'IST' },
    'BSE': { tz: 'Asia/Kolkata', openH: 9, openM: 15, closeH: 15, closeM: 30, name: 'BSE', tzLabel: 'IST' }
}

const DEFAULT_MARKET: MarketConfig = MARKET_CONFIG['US']

export function getMarketConfig(symbol: string): MarketConfig {
    const sym = symbol.trim().toUpperCase()
    let config = MARKET_CONFIG[sym]

    if (!config) {
        // Basic heuristics or default
        if (['^NDX', '^GSPC', '^DJI', '^IXIC'].includes(sym)) config = MARKET_CONFIG['^NDX'] // Map common US
        else if (sym === 'FTSE') config = MARKET_CONFIG['^FTSE'] // handle formatting alias
        else config = DEFAULT_MARKET
    }
    return config
}

export function isIndexMarketOpen(symbol: string): MarketStatus {
    const config = getMarketConfig(symbol)
    const now = new Date()

    // Get parts in target timezone
    const fmt = new Intl.DateTimeFormat('en-US', {
        timeZone: config.tz,
        hour: 'numeric',
        minute: 'numeric',
        weekday: 'short',
        hour12: false
    })

    const parts = fmt.formatToParts(now)
    const val = (t: string) => parts.find(p => p.type === t)?.value
    const h = parseInt(val('hour') || '0', 10)
    const m = parseInt(val('minute') || '0', 10)
    const w = val('weekday')

    // Weekend check (Sat/Sun)
    // Note: Intl weekday 'short' returns 'Sat', 'Sun'
    if (w === 'Sat' || w === 'Sun') {
        return {
            isOpen: false,
            message: `Market Closed: ${config.name} is closed on weekends. Opens Monday at ${formatTime(config.openH, config.openM)} (${config.tzLabel})`
        }
    }

    // Time check
    const currentMinutes = h * 60 + m
    const openMinutes = config.openH * 60 + config.openM
    const closeMinutes = config.closeH * 60 + config.closeM

    if (currentMinutes < openMinutes || currentMinutes >= closeMinutes) {
        return {
            isOpen: false,
            message: `Market Closed: ${config.name} opens at ${formatTime(config.openH, config.openM)} (${config.tzLabel})`
        }
    }

    return { isOpen: true }
}

export function getNextMarketOpenTime(symbol: string): string {
    const config = getMarketConfig(symbol)
    const now = new Date()

    // 1. Get current time parts in Target TZ
    const fmt = new Intl.DateTimeFormat('en-US', {
        timeZone: config.tz,
        hour: 'numeric',
        minute: 'numeric',
        weekday: 'short',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour12: false
    })

    const getParts = (d: Date) => {
        const p = fmt.formatToParts(d)
        const v = (t: string) => p.find(x => x.type === t)?.value
        return {
            h: parseInt(v('hour') || '0', 10),
            m: parseInt(v('minute') || '0', 10),
            w: v('weekday'),
            y: parseInt(v('year') || '0', 10),
            mo: parseInt(v('month') || '0', 10),
            d: parseInt(v('day') || '0', 10)
        }
    }

    let d = new Date(now)

    // Look ahead up to 7 days
    for (let i = 0; i < 7; i++) {
        const parts = getParts(d)
        const { h, m, w } = parts
        const isWeekend = w === 'Sat' || w === 'Sun'

        const curMin = h * 60 + m
        const openMin = config.openH * 60 + config.openM

        // If it's not a weekend, check if we can open today (must be strictly future if i==0)
        // OR if it's a future day, any 'open time' is valid.
        let validDay = !isWeekend
        if (validDay && i === 0) {
            // If today, must be before open time? 
            // If strictly before open, target is today's open.
            // If after open, target is tomorrow.
            if (curMin >= openMin) {
                validDay = false // Today's open passed, move to next
            }
        }

        if (validDay) {
            // Construct Target Date
            // Guess UTC
            let target = new Date(Date.UTC(parts.y, parts.mo - 1, parts.d, config.openH, config.openM, 0))

            // Converge
            for (let k = 0; k < 3; k++) {
                const f = new Intl.DateTimeFormat('en-US', { timeZone: config.tz, hour: 'numeric', minute: 'numeric', hour12: false })
                const p = f.formatToParts(target)
                const th = parseInt(p.find(x => x.type === 'hour')?.value || '0', 10)
                const tm = parseInt(p.find(x => x.type === 'minute')?.value || '0', 10)

                const curM = th * 60 + tm
                const desM = config.openH * 60 + config.openM

                let diff = desM - curM
                if (diff > 720) diff -= 1440
                if (diff < -720) diff += 1440

                if (diff === 0) break
                target = new Date(target.getTime() + diff * 60000)
            }

            if (target.getTime() > now.getTime()) {
                return target.toISOString()
            }
        }

        // Next day
        d = new Date(d.getTime() + 24 * 60 * 60 * 1000)
    }

    // Fallback: 24h from now
    return new Date(now.getTime() + 86400000).toISOString()
}

function formatTime(h: number, m: number): string {
    const ampm = h >= 12 ? 'PM' : 'AM'
    const h12 = h % 12 || 12
    const mStr = m < 10 ? `0${m}` : m
    return `${h12}:${mStr} ${ampm}`
}
