-- Add asset_key column
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS asset_key TEXT;

-- Backfill Logic
-- We wrap in a block to ensure safety, though standard SQL statements are fine.

UPDATE predictions
SET asset_key = CASE
    -- STOCK
    WHEN market_type = 'stock' THEN 
        'stock:' || lower(COALESCE(region, '')) || ':' || lower(trim(replace(regexp_replace(asset_symbol, '[^a-zA-Z0-9]', '', 'g'), ' ', '')))
        -- Note: For stocks, we might want to be less aggressive on regex if assets have special chars, but alphanumeric is safe for keys usually. 
        -- Actually, user input involved 'e.g. AAPL'.
        -- Let's stick to simple trim and lower for stocks to match likely TS logic.
        -- 'stock:' || lower(COALESCE(region, '')) || ':' || lower(trim(asset_symbol))

    -- CRYPTO
    WHEN category = 'Crypto' THEN 
        'crypto:' || lower(trim(regexp_replace(asset_symbol, '[^a-zA-Z0-9]', '', 'g')))

    -- FOREX
    WHEN category = 'Forex' THEN
        'forex:' || lower(substring(trim(asset_symbol) from 1 for 3)) || '_usd'

    -- COMMODITIES
    WHEN category = 'Commodities' THEN
       CASE
          WHEN upper(trim(asset_symbol)) LIKE '%GOLD%' OR upper(trim(asset_symbol)) = 'XAU' THEN 'commodity:xau'
          WHEN upper(trim(asset_symbol)) LIKE '%SILVER%' OR upper(trim(asset_symbol)) = 'XAG' THEN 'commodity:xag'
          WHEN upper(trim(asset_symbol)) IN ('OIL', 'CRUDE', 'WTI') OR upper(trim(asset_symbol)) LIKE '%OIL%' OR upper(trim(asset_symbol)) LIKE '%CRUDE%' THEN 'commodity:wti'
          WHEN upper(trim(asset_symbol)) IN ('GAS', 'NATURAL', 'NG') OR upper(trim(asset_symbol)) LIKE '%GAS%' OR upper(trim(asset_symbol)) LIKE '%NATURAL%' THEN 'commodity:ng'
          ELSE 'commodity:' || lower(trim(asset_symbol))
       END
       
    ELSE 'misc:' || lower(trim(asset_symbol))
END
WHERE asset_key IS NULL;
