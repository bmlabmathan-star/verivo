
export const HIERARCHICAL_STOCKS: Record<string, Record<string, { label: string, value: string }[]>> = {
    "USA": {
        "NASDAQ": [
            { label: "Apple Inc. (AAPL)", value: "AAPL" },
            { label: "Microsoft Corp (MSFT)", value: "MSFT" },
            { label: "Alphabet Inc. (GOOGL)", value: "GOOGL" },
            { label: "Amazon.com Inc. (AMZN)", value: "AMZN" },
            { label: "NVIDIA Corp (NVDA)", value: "NVDA" },
            { label: "Meta Platforms (META)", value: "META" },
            { label: "Tesla Inc. (TSLA)", value: "TSLA" },
            { label: "Broadcom Inc. (AVGO)", value: "AVGO" },
            { label: "PepsiCo Inc. (PEP)", value: "PEP" },
            { label: "Costco Wholesale (COST)", value: "COST" }
        ],
        "NYSE": [
            { label: "JPMorgan Chase & Co. (JPM)", value: "JPM" },
            { label: "Visa Inc. (V)", value: "V" },
            { label: "Walmart Inc. (WMT)", value: "WMT" },
            { label: "Mastercard Inc. (MA)", value: "MA" },
            { label: "Procter & Gamble (PG)", value: "PG" },
            { label: "Johnson & Johnson (JNJ)", value: "JNJ" },
            { label: "Home Depot (HD)", value: "HD" },
            { label: "AbbVie Inc. (ABBV)", value: "ABBV" },
            { label: "Merck & Co. (MRK)", value: "MRK" },
            { label: "Coca-Cola Co. (KO)", value: "KO" }
        ]
    },
    "UK": {
        "London Stock Exchange": [
            { label: "AstraZeneca (AZN)", value: "AZN.L" },
            { label: "Shell PLC (SHEL)", value: "SHEL.L" },
            { label: "HSBC Holdings (HSBA)", value: "HSBA.L" },
            { label: "Unilever PLC (ULVR)", value: "ULVR.L" },
            { label: "BP PLC (BP.)", value: "BP.L" },
            { label: "Diageo PLC (DGE)", value: "DGE.L" },
            { label: "Rio Tinto (RIO)", value: "RIO.L" },
            { label: "GlaxoSmithKline (GSK)", value: "GSK.L" },
            { label: "British American Tobacco (BATS)", value: "BATS.L" },
            { label: "Relx PLC (REL)", value: "REL.L" }
        ]
    },
    "Germany": {
        "Xetra": [
            { label: "SAP SE (SAP)", value: "SAP.DE" },
            { label: "Siemens AG (SIE)", value: "SIE.DE" },
            { label: "Allianz SE (ALV)", value: "ALV.DE" },
            { label: "Deutsche Telekom (DTE)", value: "DTE.DE" },
            { label: "Airbus SE (AIR)", value: "AIR.DE" },
            { label: "Mercedes-Benz Group (MBG)", value: "MBG.DE" },
            { label: "BMW AG (BMW)", value: "BMW.DE" },
            { label: "Volkswagen AG (VOW3)", value: "VOW3.DE" },
            { label: "BASF SE (BAS)", value: "BAS.DE" },
            { label: "Munich Re (MUV2)", value: "MUV2.DE" }
        ]
    },
    "France": {
        "Euronext Paris": [
            { label: "LVMH Moët Hennessy (MC)", value: "MC.PA" },
            { label: "L'Oréal (OR)", value: "OR.PA" },
            { label: "Hermès International (RMS)", value: "RMS.PA" },
            { label: "TotalEnergies SE (TTE)", value: "TTE.PA" },
            { label: "Sanofi (SAN)", value: "SAN.PA" },
            { label: "Air Liquide (AI)", value: "AI.PA" },
            { label: "Schneider Electric (SU)", value: "SU.PA" },
            { label: "BNP Paribas (BNP)", value: "BNP.PA" },
            { label: "Vinci SA (DG)", value: "DG.PA" },
            { label: "AXA SA (CS)", value: "CS.PA" }
        ]
    },
    "Austria": {
        "Vienna Stock Exchange": [
            { label: "Erste Group Bank (EBS)", value: "EBS.VI" },
            { label: "OMV AG (OMV)", value: "OMV.VI" },
            { label: "Verbund AG (VER)", value: "VER.VI" },
            { label: "Voestalpine AG (VOE)", value: "VOE.VI" },
            { label: "Raiffeisen Bank (RBI)", value: "RBI.VI" },
            { label: "Wienerberger AG (WIE)", value: "WIE.VI" },
            { label: "Andritz AG (ANDR)", value: "ANDR.VI" },
            { label: "BAWAG Group (BG)", value: "BG.VI" },
            { label: "CA Immobilien (CAI)", value: "CAI.VI" },
            { label: "Mayr-Melnhof Karton (MMK)", value: "MMK.VI" }
        ]
    },
    "China": {
        "Shanghai": [
            { label: "Kweichow Moutai (600519)", value: "600519.SS" },
            { label: "ICBC (601398)", value: "601398.SS" },
            { label: "Agricultural Bank of China (601288)", value: "601288.SS" },
            { label: "PetroChina (601857)", value: "601857.SS" },
            { label: "Bank of China (601988)", value: "601988.SS" }
        ],
        "Shenzhen": [
            { label: "CATL (300750)", value: "300750.SZ" },
            { label: "Wuliangye Yibin (000858)", value: "000858.SZ" },
            { label: "Midea Group (000333)", value: "000333.SZ" },
            { label: "BYD Company (002594)", value: "002594.SZ" },
            { label: "Hikvision (002415)", value: "002415.SZ" }
        ]
    },
    "Canada": {
        "Toronto Stock Exchange": [
            { label: "Royal Bank of Canada (RY)", value: "RY.TO" },
            { label: "TD Bank (TD)", value: "TD.TO" },
            { label: "Shopify Inc. (SHOP)", value: "SHOP.TO" },
            { label: "Enbridge Inc. (ENB)", value: "ENB.TO" },
            { label: "Canadian National Railway (CNR)", value: "CNR.TO" },
            { label: "Canadian Pacific Kansas City (CP)", value: "CP.TO" },
            { label: "Bank of Montreal (BMO)", value: "BMO.TO" },
            { label: "Scotiabank (BNS)", value: "BNS.TO" },
            { label: "Brookfield Corp (BN)", value: "BN.TO" },
            { label: "Nutrien Ltd. (NTR)", value: "NTR.TO" }
        ]
    },
    "Japan": {
        "Tokyo Stock Exchange": [
            { label: "Toyota Motor (7203)", value: "7203.T" },
            { label: "Sony Group (6758)", value: "6758.T" },
            { label: "Mitsubishi UFJ (8306)", value: "8306.T" },
            { label: "Keyence Corp (6861)", value: "6861.T" },
            { label: "Tokyo Electron (8035)", value: "8035.T" },
            { label: "SoftBank Group (9984)", value: "9984.T" },
            { label: "Hitachi Ltd. (6501)", value: "6501.T" },
            { label: "Fast Retailing (9983)", value: "9983.T" },
            { label: "Nintendo Co. (7974)", value: "7974.T" },
            { label: "Shin-Etsu Chemical (4063)", value: "4063.T" }
        ]
    },
    "India": {
        "NSE": [
            { label: "Reliance Industries (RELIANCE)", value: "RELIANCE.NS" },
            { label: "TCS (TCS)", value: "TCS.NS" },
            { label: "HDFC Bank (HDFCBANK)", value: "HDFCBANK.NS" },
            { label: "Infosys (INFY)", value: "INFY.NS" },
            { label: "Bharti Airtel (BHARTIARTL)", value: "BHARTIARTL.NS" },
            { label: "ICICI Bank (ICICIBANK)", value: "ICICIBANK.NS" },
            { label: "State Bank of India (SBIN)", value: "SBIN.NS" },
            { label: "ITC Ltd (ITC)", value: "ITC.NS" },
            { label: "Larsen & Toubro (LT)", value: "LT.NS" },
            { label: "Hindustan Unilever (HINDUNILVR)", value: "HINDUNILVR.NS" }
        ],
        "BSE": [
            { label: "Reliance Industries (500325)", value: "500325.BO" },
            { label: "TCS (532540)", value: "532540.BO" },
            { label: "HDFC Bank (500180)", value: "500180.BO" },
            { label: "Infosys (500209)", value: "500209.BO" },
            { label: "Bharti Airtel (532454)", value: "532454.BO" }
        ]
    }
}
