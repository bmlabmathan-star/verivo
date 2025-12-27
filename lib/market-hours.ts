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
    '^BSESN': { tz: 'Asia/Kolkata', openH: 9, openM: 15, closeH: 15, closeM: 30, name: 'SENSEX', tzLabel: 'IST' }
}

const DEFAULT_MARKET: MarketConfig = MARKET_CONFIG['US']

export function isIndexMarketOpen(symbol: string): MarketStatus {
    const sym = symbol.trim().toUpperCase()
    // Default to US if not found (or maybe check generic 'US')
    // We use contains check or direct lookup. Direct lookup is safer.
    // We'll allow falling back to US if the symbol looks like a standard ticker not in list? 
    // For now strict lookup is better for known indices, but we need a fallback.
    // The user prompt implies "NASDAQ / NYSE -> America/New_York".

    let config = MARKET_CONFIG[sym]

    if (!config) {
        // Basic heuristics or default
        if (['^NDX', '^GSPC', '^DJI', '^IXIC'].includes(sym)) config = MARKET_CONFIG['^NDX'] // Map common US
        else if (sym === 'FTSE') config = MARKET_CONFIG['^FTSE'] // handle formatting alias
        else config = DEFAULT_MARKET
    }

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

function formatTime(h: number, m: number): string {
    const ampm = h >= 12 ? 'PM' : 'AM'
    const h12 = h % 12 || 12
    const mStr = m < 10 ? `0${m}` : m
    return `${h12}:${mStr} ${ampm}`
}
