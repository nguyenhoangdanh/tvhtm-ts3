"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { RefreshCw, ChevronDown } from 'lucide-react'
import { useProductionStore } from "@/stores/productionStore"
import { useProductionDataCD } from "@/hooks/useProductionDataCD"
import useTime from "@/hooks/useTime"
import { getPercentageColor } from "@/lib/utils"
import { lastDayOfDecade } from "date-fns"

interface TVDisplayCDProps {
  maChuyenLine?: string
  factory?: string
  line?: string
  team?: string
  refreshInterval?: number
  tvMode?: boolean
}

export default function TVDisplayCD({
  maChuyenLine,
  factory,
  line,
  team,
  refreshInterval = 30000,
  tvMode = false,
}: TVDisplayCDProps) {
  const { minutes, hours } = useTime({})
  const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`

  const [realtimeData, setRealtimeData] = useState<any>(null)

  const { data, loading, error, connected, refresh } = useProductionDataCD({
    maChuyenLine,
    factory,
    line,
    team,
    enableRealtime: true,
    tvMode,
  })


  const hasDiffLayoutCoMat = useProductionStore((state) => state.data.diffLdCoMatLayout || 0) !== 0;

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "f" || e.key === "F") {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen()
        } else {
          document.exitFullscreen()
        }
      }
    }

    document.addEventListener("keydown", handleKeyPress)
    return () => document.removeEventListener("keydown", handleKeyPress)
  }, [])

  useEffect(() => {
    if (data) {
      const newRealtimeData = {
        maChuyenLine: data.maChuyenLine,
        factory: data.factory,
        allLines: data.allLines || [],
        data: [...(data.data || [])],
        summary: data.summary,
        lastUpdate: new Date().toISOString(),
      }
      setRealtimeData(newRealtimeData)
    }
  }, [data])


  useEffect(() => {
    if (!connected && refreshInterval > 0) {
      const interval = setInterval(refresh, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [connected, refresh, refreshInterval])


  if (loading && !realtimeData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center">
        <div className="text-white text-2xl flex items-center gap-3">
          <RefreshCw className="animate-spin" size={32} />
          Đang tải dữ liệu real-time...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 to-red-700 flex items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Lỗi kết nối</h2>
          <p className="text-xl mb-6">{error}</p>
          <button
            onClick={refresh}
            className="bg-white text-red-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  if (!realtimeData || !realtimeData.summary) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-2xl">Không có dữ liệu</div>
      </div>
    )
  }

  // Mock data for initial layout matching Excel
  const mockData = {
    factory: realtimeData?.factory || 'TS1',
    summary: {
      ldCoMat: 253,
      ldDinhBien: 260,
      khNgay: 5880,
      lkkh: 1580,
      lkth: 1460,
      tonMay: 3800,
      ncdv: 8000,
      dbcu: 7120,
      day1: 2825,
      day2: 7220,
      day3: 6820
    },
    teams: [
      {
        id: 'CD1',
        teamNumber: '11',
        ldCoMat: 55,
        ldDinhBien: 60,
        khNgay: 1470,
        products: [
          { khNgay: 400, lkkh: 200, lkth: 200, maHang: 'FC34R15/BU15', mau: '', tonMay: 200, ncdv: 300, dbcu: 300, day1: 300, day2: 300, day3: '', ghiChu: 'hàng lỗi' },
          { khNgay: 380, lkkh: 300, lkth: 270, maHang: 'BAE131/AS20', mau: '', tonMay: 100, ncdv: 350, dbcu: 320, day1: 400, day2: 400, day3: '', ghiChu: '' },
          { khNgay: 350, lkkh: 320, lkth: 220, maHang: 'YC7WQ2/DD11', mau: '', tonMay: 150, ncdv: 400, dbcu: 280, day1: 25, day2: 405, day3: 405, ghiChu: '' },
          { khNgay: 340, lkkh: 250, lkth: 200, maHang: 'TBAV2/H10', mau: '', tonMay: 200, ncdv: 450, dbcu: 380, day1: '', day2: 700, day3: 700, ghiChu: '' },
          { khNgay: 340, lkkh: 250, lkth: 150, maHang: 'TBAV2/H10', mau: '', tonMay: 200, ncdv: 450, dbcu: 200, day1: '', day2: 700, day3: 700, ghiChu: '' },
        ]
      },
      {
        id: 'CD2',
        teamNumber: '11',
        ldCoMat: 60,
        ldDinhBien: 60,
        products: [
          { khNgay: 400, lkkh: 200, lkth: 180, maHang: 'FC34R15/BU15', mau: '', tonMay: 200, ncdv: 300, dbcu: 290, day1: 300, day2: 300, day3: '', ghiChu: 'hàng lỗi' },
          { khNgay: 380, lkkh: 300, lkth: 250, maHang: 'BAE131/AS20', mau: '', tonMay: 100, ncdv: 350, dbcu: 300, day1: 400, day2: 400, day3: '', ghiChu: '' },
          { khNgay: 350, lkkh: 320, lkth: 240, maHang: 'YC7WQ2/DD11', mau: '', tonMay: 150, ncdv: 400, dbcu: 250, day1: '', day2: 405, day3: 405, ghiChu: '' },
          { khNgay: 340, lkkh: 250, lkth: 210, maHang: 'TBAV2/H10', mau: '', tonMay: 200, ncdv: 450, dbcu: 400, day1: '', day2: 700, day3: 700, ghiChu: '' },
          { khNgay: 340, lkkh: 250, lkth: 180, maHang: 'TBAV2/H10', mau: '', tonMay: 200, ncdv: 450, dbcu: 350, day1: '', day2: 700, day3: 700, ghiChu: '' },
        ]
      },
      {
        id: 'CD3',
        teamNumber: '11',
        ldCoMat: 66,
        ldDinhBien: 65,
        products: [
          { khNgay: 400, lkkh: 200, lkth: 190, maHang: 'FC34R15/BU15', mau: '', tonMay: 200, ncdv: 300, dbcu: 280, day1: 300, day2: 300, day3: '', ghiChu: 'hàng lỗi' },
          { khNgay: 380, lkkh: 300, lkth: 280, maHang: 'BAE131/AS20', mau: '', tonMay: 100, ncdv: 350, dbcu: 330, day1: 400, day2: 400, day3: '', ghiChu: '' },
          { khNgay: 350, lkkh: 320, lkth: 230, maHang: 'YC7WQ2/DD11', mau: '', tonMay: 150, ncdv: 400, dbcu: 270, day1: '', day2: 405, day3: 405, ghiChu: '' },
          { khNgay: 350, lkkh: 320, lkth: 260, maHang: 'YC7WQ2/DD11', mau: '', tonMay: 150, ncdv: 400, dbcu: 320, day1: '', day2: 405, day3: 405, ghiChu: '' },
          { khNgay: 350, lkkh: 320, lkth: 170, maHang: 'YC7WQ2/DD11', mau: '', tonMay: 150, ncdv: 400, dbcu: 220, day1: '', day2: 405, day3: 405, ghiChu: '' },
        ]
      },
      {
        id: 'CD4',
        teamNumber: '11',
        ldCoMat: 72,
        ldDinhBien: 75,
        products: [
          { khNgay: 400, lkkh: 200, lkth: 195, maHang: 'FC34R15/BU15', mau: '', tonMay: 200, ncdv: 300, dbcu: 310, day1: 300, day2: 300, day3: '', ghiChu: 'hàng lỗi' },
          { khNgay: 380, lkkh: 300, lkth: 265, maHang: 'BAE131/AS20', mau: '', tonMay: 100, ncdv: 350, dbcu: 300, day1: 400, day2: 400, day3: '', ghiChu: '' },
          { khNgay: 380, lkkh: 300, lkth: 290, maHang: 'BAE131/AS20', mau: '', tonMay: 100, ncdv: 350, dbcu: 340, day1: 400, day2: 400, day3: '', ghiChu: '' },
          { khNgay: 380, lkkh: 300, lkth: 245, maHang: 'BAE131/AS20', mau: '', tonMay: 100, ncdv: 350, dbcu: 290, day1: 400, day2: 400, day3: '', ghiChu: '' },
          { khNgay: 380, lkkh: 300, lkth: 160, maHang: 'BAE131/AS20', mau: '', tonMay: 100, ncdv: 350, dbcu: 180, day1: 400, day2: 400, day3: '', ghiChu: '' },
        ]
      }
    ]
  };

  // Calculate summary totals from teams
  mockData.summary.khNgay = mockData.teams.reduce((sum, team) => 
    sum + team.products.reduce((teamSum, product) => teamSum + product.khNgay, 0), 0);
  
  mockData.summary.lkkh = mockData.teams.reduce((sum, team) => 
    sum + team.products.reduce((teamSum, product) => teamSum + product.lkkh, 0), 0);
  
  mockData.summary.lkth = mockData.teams.reduce((sum, team) => 
    sum + team.products.reduce((teamSum, product) => teamSum + product.lkth, 0), 0);
  
  mockData.summary.tonMay = mockData.teams.reduce((sum, team) => 
    sum + team.products.reduce((teamSum, product) => teamSum + product.tonMay, 0), 0);
  
  mockData.summary.ncdv = mockData.teams.reduce((sum, team) => 
    sum + team.products.reduce((teamSum, product) => teamSum + product.ncdv, 0), 0);
  
  mockData.summary.dbcu = mockData.teams.reduce((sum, team) => 
    sum + team.products.reduce((teamSum, product) => teamSum + product.dbcu, 0), 0);

  // Calculate next 3 working days (skip Sunday)
  const getNextThreeDays = () => {
    const today = new Date();
    const nextDays: string[] = [];
    let daysAdded = 0;
    let offset = 1;

    while (daysAdded < 3) {
      const date = new Date(today);
      date.setDate(date.getDate() + offset);
      
      // Skip Sunday (0 = Sunday)
      if (date.getDay() !== 0) {
        nextDays.push(`${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`);
        daysAdded++;
      }
      
      offset++;
    }

    return nextDays;
  };

  const nextDays = getNextThreeDays();

  // Format number with dots for thousands separator
  const formatNumber = (num: number): string => {
    return num.toLocaleString('vi-VN');
  };

  // Calculate total rows and dynamic font sizes (max 28 rows: 4 teams x 7 rows)
  // Each team needs minimum 2 rows for TỔ/TGLV display
  const totalRows = mockData.teams.reduce((sum, team) => {
    const actualRows = Math.min(team.products.length, 7);
    const displayRows = Math.max(actualRows, 2); // Minimum 2 rows per team
    return sum + displayRows;
  }, 0);

  // Dynamic font sizes based on TOTAL row count (max 28 rows)
  const getFontSizes = (totalRowCount: number) => {
    // Base font size optimized for 20 rows display - larger fonts due to less content
    const baseFontMultiplier = Math.max(0.75, 1.55 - (totalRowCount * 0.025)); // Increased base for 20 rows max

    return {
      base: `clamp(${baseFontMultiplier * 0.95}rem, ${baseFontMultiplier * 1.9}vw, ${baseFontMultiplier * 1.4}rem)`,
      small: `clamp(${baseFontMultiplier * 0.85}rem, ${baseFontMultiplier * 1.7}vw, ${baseFontMultiplier * 1.25}rem)`,
      ldCoMat: `clamp(${baseFontMultiplier * 1.05}rem, ${baseFontMultiplier * 2.1}vw, ${baseFontMultiplier * 1.6}rem)`,
      label: `clamp(${baseFontMultiplier * 0.95}rem, ${baseFontMultiplier * 1.9}vw, ${baseFontMultiplier * 1.4}rem)`,
      maHang: `clamp(${baseFontMultiplier * 0.85}rem, ${baseFontMultiplier * 1.7}vw, ${baseFontMultiplier * 1.25}rem)`,
      ghiChu: `clamp(${baseFontMultiplier * 0.7}rem, ${baseFontMultiplier * 1.4}vw, ${baseFontMultiplier * 1.1}rem)`,
      padding: 'px-0.5 py-0.5'
    };
  }; const fontSizes = getFontSizes(totalRows);

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-slate-900 text-white"
      style={{ letterSpacing: '0.5em', }}
    >
      {/* Row 1: Logo and Header - Fixed height */}
      <div className="w-full flex flex-row items-center gap-4 sm:gap-8 md:gap-12 lg:gap-16 px-2 sm:px-3 flex-shrink-0" style={{ height: '4.5vh' }}>
        <div
          className="relative bg-white/95 rounded backdrop-blur-sm shadow-lg flex items-center justify-center flex-shrink-0"
          style={{
            width: "clamp(1.8rem, 2.8vw, 2.4rem)",
            height: "clamp(1.8rem, 2.8vw, 2.4rem)",
            aspectRatio: "1"
          }}
        >
          <img
            src="/logo.png"
            alt="TBS GROUP Logo"
            className="w-full h-full object-contain filter drop-shadow-xl"
            loading="eager"
          />
        </div>
        <span className="text-white font-black drop-shadow-lg whitespace-nowrap"
          style={{ fontSize: "clamp(0.9rem, 2vw, 1.6rem)", letterSpacing: '0.05em' }}>
          {`${mockData.factory}_LINE_CD`}
        </span>
        <div className="flex-1 text-left min-w-0">
          <div
            style={{ fontSize: "clamp(0.9rem, 2vw, 1.6rem)", letterSpacing: '0.05em' }}
            className="font-black text-white leading-tight drop-shadow-lg truncate"
          >
            BẢNG THEO DÕI KẾT QUẢ & CUNG ỨNG ĐẦU VÀO CHO MAY
          </div>
        </div>
      </div>

      {/* Row 2: Table Header - Fixed height */}
      <div className="flex-shrink-0 border border-yellow-400 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 shadow-xl" style={{ height: '5.5vh' }}>
        <div className=" header-cd grid h-full" style={{ gridTemplateColumns: '0.35fr 0.35fr 0.9fr 0.45fr 0.45fr 0.55fr 0.55fr 0.65fr 0.65fr 0.6fr 0.5fr 0.5fr 0.5fr 0.9fr' }}>
          {/* TỔ / TGLV */}
          {/* <div className="border-r-3 border-yellow-400 flex flex-col overflow-hidden">
            <div className="flex-1 flex items-center justify-center border-b-3 border-yellow-400">
              <span className="font-black text-[clamp(0.9rem,1.8vw,1.4rem)] text-yellow-300 drop-shadow-md">TỔ</span>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <span className="font-black text-[clamp(0.9rem,1.8vw,1.4rem)] text-yellow-300 drop-shadow-md">TGLV</span>
            </div>
          </div> */}

          <div className="border-r-3 border-yellow-400 text-center font-black flex items-center justify-center text-yellow-300 drop-shadow-md overflow-hidden px-1" style={{ fontSize: 'clamp(0.7rem, 1.4vw, 1.1rem)' }}>
            <span className="leading-tight">TỔ - TGLV</span>
          </div>

          <div className="border-r-3 border-yellow-400 text-center font-black flex items-center justify-center text-yellow-300 drop-shadow-md overflow-hidden px-1" style={{ fontSize: 'clamp(0.7rem, 1.4vw, 1.1rem)' }}>
            <span className="leading-tight">/CM/ĐB</span>
          </div>

          {/* MÃ HÀNG/MÀU */}
          <div className="border-r-3 border-yellow-400 text-center font-black flex items-center justify-center text-yellow-300 drop-shadow-md overflow-hidden px-1" style={{ fontSize: 'clamp(0.8rem, 1.6vw, 1.2rem)' }}>
            <span className="leading-tight">STYLE - MÀU</span>
          </div>

          <div className="border-r-3 border-yellow-400 text-center font-black flex items-center justify-center text-yellow-300 drop-shadow-md overflow-hidden" style={{ fontSize: 'clamp(0.85rem, 1.7vw, 1.3rem)' }}>
            <span className="leading-tight">KH NGÀY</span>
          </div>

          {/* LKKH - Separate column */}
          <div className="border-r-3 border-yellow-400 text-center font-black flex items-center justify-center text-yellow-300 drop-shadow-md overflow-hidden" style={{ fontSize: 'clamp(0.85rem, 1.7vw, 1.3rem)' }}>
            <span>LKKH</span>
          </div>

          {/* LKTH - Separate column */}
          <div className="border-r-3 border-yellow-400 text-center font-black flex items-center justify-center text-yellow-300 drop-shadow-md overflow-hidden" style={{ fontSize: 'clamp(0.85rem, 1.7vw, 1.3rem)' }}>
            <span>LKTH</span>
          </div>



          <div className="border-r-3 border-yellow-400 text-center font-black flex items-center justify-center text-yellow-300 drop-shadow-md overflow-hidden" style={{ fontSize: 'clamp(0.85rem, 1.7vw, 1.3rem)' }}>
            <span className="leading-tight">TỒN MAY</span>
          </div>

          <div className="border-r-3 border-yellow-400 text-center font-black flex items-center justify-center text-yellow-300 drop-shadow-md overflow-hidden px-1" style={{ fontSize: 'clamp(0.75rem, 1.5vw, 1.15rem)' }}>
            <span className="leading-tight">NCĐV</span>
          </div>

          <div className="border-r-3 border-yellow-400 text-center font-black flex items-center justify-center text-yellow-300 drop-shadow-md overflow-hidden px-1" style={{ fontSize: 'clamp(0.75rem, 1.5vw, 1.15rem)' }}>
            <span className="leading-tight">ĐBCỨ</span>
          </div>

          <div className="border-r-3 border-yellow-400 text-center font-black flex items-center justify-center text-yellow-300 drop-shadow-md overflow-hidden" style={{ fontSize: 'clamp(0.85rem, 1.7vw, 1.3rem)' }}>
            <span className="leading-tight">%ĐÁP ỨNG</span>
          </div>

          {nextDays.map((day, idx) => (
            <div key={idx} className="border-r-3 border-yellow-400 text-center font-black flex items-center justify-center text-yellow-300 drop-shadow-md overflow-hidden" style={{ fontSize: 'clamp(0.85rem, 1.7vw, 1.3rem)' }}>
              <span>{day}</span>
            </div>
          ))}

          <div className="text-center font-black flex items-center justify-center text-yellow-300 drop-shadow-md overflow-hidden" style={{ fontSize: 'clamp(0.85rem, 1.7vw, 1.3rem)' }}>
            <span>GHI CHÚ</span>
          </div>
        </div>
      </div>

      {/* Row 3: Summary Row (LINE CD) - Fixed height */}
      <div className="header-cd flex-shrink-0 border border-yellow-500 bg-gradient-to-r from-yellow-200 via-yellow-100 to-yellow-200 shadow-lg"
        style={{ height: '4vh', fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif', letterSpacing: '0.2em' }}>
        <div className="grid h-full" style={{ gridTemplateColumns: '0.35fr 0.35fr 0.9fr 0.45fr 0.45fr 0.55fr 0.55fr 0.65fr 0.65fr 0.6fr 0.5fr 0.5fr 0.5fr 0.9fr' }}>
          <div className="border-r border-yellow-500 text-center font-black flex items-center justify-center text-slate-900 overflow-hidden" style={{ fontSize: 'clamp(0.8rem, 1.6vw, 1.2rem)' }}>CD</div>
          <div className="border-r border-yellow-500 text-center font-black text-slate-900 overflow-hidden" style={{ fontSize: 'clamp(0.65rem, 1.3vw, 1rem)' }}>
            <div className="flex flex-col h-full items-center justify-center gap-1 py-0.5">
              <div className="leading-tight">
                {mockData.summary.ldDinhBien}/{mockData.summary.ldCoMat}
              </div>
              {mockData.summary.ldCoMat !== mockData.summary.ldDinhBien && (
                <div className={`text-xs leading-tight ${mockData.summary.ldCoMat > mockData.summary.ldDinhBien ? 'text-green-600' : 'text-red-600'}`}>
                  ({mockData.summary.ldCoMat > mockData.summary.ldDinhBien ? '+' : ''}{mockData.summary.ldCoMat - mockData.summary.ldDinhBien})
                </div>
              )}
            </div>
          </div>
          <div className="border-r border-yellow-500 text-center font-black flex items-center justify-center text-slate-900 overflow-hidden" style={{ fontSize: 'clamp(0.8rem, 1.6vw, 1.2rem)' }}>-</div>
          <div className="border-r border-yellow-500 text-center font-black flex items-center justify-center text-slate-900 overflow-hidden" style={{ fontSize: 'clamp(0.8rem, 1.6vw, 1.2rem)' }}>{formatNumber(mockData.summary.khNgay)}</div>
          <div className="border-r border-yellow-500 text-center font-black flex items-center justify-center text-slate-900 overflow-hidden" style={{ fontSize: 'clamp(0.8rem, 1.6vw, 1.2rem)' }}>{formatNumber(mockData.summary.lkkh)}</div>
          <div className={`border-r border-yellow-500 text-center font-black flex items-center justify-center overflow-hidden ${getPercentageColor((mockData.summary.lkth / mockData.summary.lkkh) * 100).bgColor} ${getPercentageColor((mockData.summary.lkth / mockData.summary.lkkh) * 100).textColor}`} style={{ fontSize: 'clamp(0.8rem, 1.6vw, 1.2rem)' }}>{formatNumber(mockData.summary.lkth)}</div>
          <div className="border-r border-yellow-500 text-center font-black flex items-center justify-center text-slate-900 overflow-hidden" style={{ fontSize: 'clamp(0.8rem, 1.6vw, 1.2rem)' }}>{formatNumber(mockData.summary.tonMay)}</div>
          <div className="border-r border-yellow-500 text-center font-black flex items-center justify-center text-slate-900 overflow-hidden" style={{ fontSize: 'clamp(0.8rem, 1.6vw, 1.2rem)' }}>{formatNumber(mockData.summary.ncdv)}</div>
          <div className="border-r border-yellow-500 text-center font-black flex items-center justify-center text-slate-900 overflow-hidden" style={{ fontSize: 'clamp(0.8rem, 1.6vw, 1.2rem)' }}>{formatNumber(mockData.summary.dbcu)}</div>
          <div className={`border-r border-yellow-500 text-center font-black flex items-center justify-center overflow-hidden ${getPercentageColor((mockData.summary.dbcu / mockData.summary.ncdv) * 100).bgColor} ${getPercentageColor((mockData.summary.dbcu / mockData.summary.ncdv) * 100).textColor}`} style={{ fontSize: 'clamp(0.8rem, 1.6vw, 1.2rem)' }}>{Math.round((mockData.summary.dbcu / mockData.summary.ncdv) * 100)}%</div>
          <div className="border-r border-yellow-500 text-center font-black flex items-center justify-center text-slate-900 overflow-hidden" style={{ fontSize: 'clamp(0.8rem, 1.6vw, 1.2rem)' }}>{formatNumber(mockData.summary.day1)}</div>
          <div className="border-r border-yellow-500 text-center font-black flex items-center justify-center text-slate-900 overflow-hidden" style={{ fontSize: 'clamp(0.8rem, 1.6vw, 1.2rem)' }}>{formatNumber(mockData.summary.day2)}</div>
          <div className="border-r border-yellow-500 text-center font-black flex items-center justify-center text-slate-900 overflow-hidden" style={{ fontSize: 'clamp(0.8rem, 1.6vw, 1.2rem)' }}>{formatNumber(mockData.summary.day3)}</div>
          <div className="text-center font-black flex items-center justify-center text-slate-900 overflow-hidden" style={{ fontSize: 'clamp(0.8rem, 1.6vw, 1.2rem)' }}>-</div>
        </div>
      </div>

      {/* Rows 4-15: Table Body - Using HTML table with rowspan */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {mockData.teams.map((team, teamIdx) => {
          const borderColor = teamIdx === 0 ? 'border-violet-500' : teamIdx === 1 ? 'border-emerald-500' : teamIdx === 2 ? 'border-amber-500' : 'border-sky-500';
          const teamHeaderBg = teamIdx === 0 ? 'bg-violet-400' : teamIdx === 1 ? 'bg-emerald-400' : teamIdx === 2 ? 'bg-amber-400' : 'bg-sky-400';
          const teamRowBg = teamIdx === 0 ? 'bg-slate-800/95' : teamIdx === 1 ? 'bg-slate-800/90' : teamIdx === 2 ? 'bg-slate-800/85' : 'bg-slate-800/80';
          const actualRowCount = Math.min(team.products.length, 7);
          const displayRowCount = Math.max(actualRowCount, 2); // Minimum 2 rows for TỔ/TGLV display

          // Calculate height - ensure proportional distribution based on display rows
          // Total available height = 86vh (100vh - 4.5vh header - 5.5vh table header - 4vh summary)
          const availableHeight = 86;
          const heightPercentage = (displayRowCount / totalRows) * availableHeight;

          return (
            <div key={teamIdx} className={`border-l-2 border-r-2 ${teamIdx < mockData.teams.length - 1 ? `border-b-2` : 'border-b-2'} ${borderColor} ${teamIdx === 0 ? `border-t-2 ${borderColor}` : `border-t-2 ${borderColor}`}`} style={{ height: `${heightPercentage}vh` }}>
              <table className="w-full h-full border-collapse" style={{ tableLayout: 'fixed' }}>
                <colgroup>
                  <col style={{ width: '3.4%' }} />
                  <col style={{ width: '3.5%' }} />
                  <col style={{ width: '9%' }} />
                  <col style={{ width: '4.5%' }} />
                  <col style={{ width: '4.5%' }} />
                  <col style={{ width: '5.5%' }} />
                  <col style={{ width: '5.5%' }} />
                  <col style={{ width: '6.5%' }} />
                  <col style={{ width: '6.5%' }} />
                  <col style={{ width: '6%' }} />
                  <col style={{ width: '5%' }} />
                  <col style={{ width: '5%' }} />
                  <col style={{ width: '5%' }} />
                  <col style={{ width: '9%' }} />
                </colgroup>
                <tbody>
                  {team.products.slice(0, 7).map((row, rowIdx) => {
                    const dapUng = (row.dbcu / row.ncdv) * 100;
                    const progressColor = getPercentageColor(dapUng);

                    return (
                      <tr key={rowIdx} className={teamRowBg}>
                        {/* TỔ - Show CD1/CD2/CD3/CD4 on first row only with rowspan */}
                        {rowIdx === 0 && (
                          <td rowSpan={displayRowCount} className={`border-r border-current text-center font-black ${teamHeaderBg} text-slate-900 overflow-hidden`} style={{ fontSize: fontSizes.label }}>
                            <div className="flex flex-col h-full">
                              <div className="flex-1 flex items-center justify-center border-b border-current">
                                {team.id}
                              </div>
                              <div className="flex-1 flex items-center justify-center bg-slate-700 text-white">
                                {team.teamNumber}
                              </div>
                            </div>
                          </td>
                        )}

                        {/* LĐ CÓ MẶT / ĐB - Merged cell with rowspan showing both values */}
                        {rowIdx === 0 && (
                          <td rowSpan={displayRowCount} className="border-r border-current text-center font-black bg-slate-700 text-white overflow-hidden" style={{ fontSize: fontSizes.small }}>
                            <div className="flex flex-col h-full items-center justify-center gap-2 py-1">
                              <div className="leading-tight">
                                {team.ldCoMat}/{team.ldDinhBien}
                              </div>
                              {team.ldCoMat !== team.ldDinhBien && (
                                <div className={`text-xs leading-tight ${team.ldCoMat > team.ldDinhBien ? 'text-green-400' : 'text-red-400'}`}>
                                  ({team.ldCoMat > team.ldDinhBien ? '+' : ''}{team.ldCoMat - team.ldDinhBien})
                                </div>
                              )}
                            </div>
                          </td>
                        )}

                        {/* MÃ HÀNG/MÀU */}
                        <td className={`border-r-2 ${borderColor} ${rowIdx > 0 ? `border-t ${borderColor}` : ''} text-center font-black text-white overflow-hidden align-middle ${fontSizes.padding}`}
                          style={{
                            fontSize: fontSizes.maHang,
                            lineHeight: '1.2',
                            backgroundColor: rowIdx % 2 === 0
                              ? (teamIdx === 0 ? '#3f3f5e' : teamIdx === 1 ? '#2d4a3e' : teamIdx === 2 ? '#4a3d2d' : '#2d3e4a')
                              : (teamIdx === 0 ? '#353548' : teamIdx === 1 ? '#253931' : teamIdx === 2 ? '#3d3226' : '#25333d')
                          }}>
                          <div className="truncate">{row.maHang}{row.mau}</div>
                        </td>

                        {/* KH NGÀY */}
                        <td className={`border-r-2 ${borderColor} ${rowIdx > 0 ? `border-t ${borderColor}` : ''} text-center font-black text-white overflow-hidden align-middle ${fontSizes.padding}`}
                          style={{
                            fontSize: fontSizes.base,
                            backgroundColor: rowIdx % 2 === 0
                              ? (teamIdx === 0 ? '#3f3f5e' : teamIdx === 1 ? '#2d4a3e' : teamIdx === 2 ? '#4a3d2d' : '#2d3e4a')
                              : (teamIdx === 0 ? '#353548' : teamIdx === 1 ? '#253931' : teamIdx === 2 ? '#3d3226' : '#25333d')
                          }}>
                          {row.khNgay}
                        </td>

                        {/* LKKH */}
                        <td className={`border-r-2 ${borderColor} ${rowIdx > 0 ? `border-t ${borderColor}` : ''} text-center font-black text-white overflow-hidden align-middle ${fontSizes.padding}`}
                          style={{
                            fontSize: fontSizes.base,
                            backgroundColor: rowIdx % 2 === 0
                              ? (teamIdx === 0 ? '#3f3f5e' : teamIdx === 1 ? '#2d4a3e' : teamIdx === 2 ? '#4a3d2d' : '#2d3e4a')
                              : (teamIdx === 0 ? '#353548' : teamIdx === 1 ? '#253931' : teamIdx === 2 ? '#3d3226' : '#25333d')
                          }}>
                          {row.lkkh}
                        </td>

                        {/* LKTH */}
                        <td className={`border-r-2 ${borderColor} ${rowIdx > 0 ? `border-t ${borderColor}` : ''} text-center font-black overflow-hidden align-middle ${fontSizes.padding} ${getPercentageColor((row.lkth / row.lkkh) * 100).bgColor} ${getPercentageColor((row.lkth / row.lkkh) * 100).textColor}`}
                          style={{
                            fontSize: fontSizes.base
                          }}>
                          {row.lkth}
                        </td>



                        {/* TỒN MAY */}
                        <td className={`border-r-2 ${borderColor} ${rowIdx > 0 ? `border-t ${borderColor}` : ''} text-center font-black text-white overflow-hidden align-middle ${fontSizes.padding}`}
                          style={{
                            fontSize: fontSizes.base,
                            backgroundColor: rowIdx % 2 === 0
                              ? (teamIdx === 0 ? '#3f3f5e' : teamIdx === 1 ? '#2d4a3e' : teamIdx === 2 ? '#4a3d2d' : '#2d3e4a')
                              : (teamIdx === 0 ? '#353548' : teamIdx === 1 ? '#253931' : teamIdx === 2 ? '#3d3226' : '#25333d')
                          }}>
                          {row.tonMay}
                        </td>

                        {/* NC ĐẦU VÀO */}
                        <td className={`border-r-2 ${borderColor} ${rowIdx > 0 ? `border-t ${borderColor}` : ''} text-center font-black text-white overflow-hidden align-middle ${fontSizes.padding}`}
                          style={{
                            fontSize: fontSizes.base,
                            backgroundColor: rowIdx % 2 === 0
                              ? (teamIdx === 0 ? '#3f3f5e' : teamIdx === 1 ? '#2d4a3e' : teamIdx === 2 ? '#4a3d2d' : '#2d3e4a')
                              : (teamIdx === 0 ? '#353548' : teamIdx === 1 ? '#253931' : teamIdx === 2 ? '#3d3226' : '#25333d')
                          }}>
                          {row.ncdv}
                        </td>

                        {/* ĐB CUNG ỨNG */}
                        <td className={`border-r-2 ${borderColor} ${rowIdx > 0 ? `border-t ${borderColor}` : ''} text-center font-black text-white overflow-hidden align-middle ${fontSizes.padding}`}
                          style={{
                            fontSize: fontSizes.base,
                            backgroundColor: rowIdx % 2 === 0
                              ? (teamIdx === 0 ? '#3f3f5e' : teamIdx === 1 ? '#2d4a3e' : teamIdx === 2 ? '#4a3d2d' : '#2d3e4a')
                              : (teamIdx === 0 ? '#353548' : teamIdx === 1 ? '#253931' : teamIdx === 2 ? '#3d3226' : '#25333d')
                          }}>
                          {row.dbcu}
                        </td>

                        {/* % ĐÁP ỨNG */}
                        <td className={`border-r-2 ${borderColor} ${rowIdx > 0 ? `border-t ${borderColor}` : ''} ${progressColor.bgColor} ${progressColor.textColor} text-center font-black overflow-hidden align-middle ${fontSizes.padding}`} style={{ fontSize: fontSizes.base }}>
                          {Math.round(dapUng)}%
                        </td>

                        {/* Day 1 */}
                        <td className={`border-r-2 ${borderColor} ${rowIdx > 0 ? `border-t ${borderColor}` : ''} text-center font-black text-white overflow-hidden align-middle ${fontSizes.padding}`}
                          style={{
                            fontSize: fontSizes.base,
                            backgroundColor: rowIdx % 2 === 0
                              ? (teamIdx === 0 ? '#3f3f5e' : teamIdx === 1 ? '#2d4a3e' : teamIdx === 2 ? '#4a3d2d' : '#2d3e4a')
                              : (teamIdx === 0 ? '#353548' : teamIdx === 1 ? '#253931' : teamIdx === 2 ? '#3d3226' : '#25333d')
                          }}>
                          {row.day1 || ''}
                        </td>

                        {/* Day 2 */}
                        <td className={`border-r-2 ${borderColor} ${rowIdx > 0 ? `border-t ${borderColor}` : ''} text-center font-black text-white overflow-hidden align-middle ${fontSizes.padding}`}
                          style={{
                            fontSize: fontSizes.base,
                            backgroundColor: rowIdx % 2 === 0
                              ? (teamIdx === 0 ? '#3f3f5e' : teamIdx === 1 ? '#2d4a3e' : teamIdx === 2 ? '#4a3d2d' : '#2d3e4a')
                              : (teamIdx === 0 ? '#353548' : teamIdx === 1 ? '#253931' : teamIdx === 2 ? '#3d3226' : '#25333d')
                          }}>
                          {row.day2 || ''}
                        </td>

                        {/* Day 3 */}
                        <td className={`border-r-2 ${borderColor} ${rowIdx > 0 ? `border-t ${borderColor}` : ''} text-center font-black text-white overflow-hidden align-middle ${fontSizes.padding}`}
                          style={{
                            fontSize: fontSizes.base,
                            backgroundColor: rowIdx % 2 === 0
                              ? (teamIdx === 0 ? '#3f3f5e' : teamIdx === 1 ? '#2d4a3e' : teamIdx === 2 ? '#4a3d2d' : '#2d3e4a')
                              : (teamIdx === 0 ? '#353548' : teamIdx === 1 ? '#253931' : teamIdx === 2 ? '#3d3226' : '#25333d')
                          }}>
                          {row.day3 || ''}
                        </td>

                        {/* GHI CHÚ */}
                        <td className={`${rowIdx > 0 ? `border-t ${borderColor}` : ''} text-center font-black text-white overflow-hidden align-middle ${fontSizes.padding}`}
                          style={{
                            fontSize: fontSizes.ghiChu,
                            backgroundColor: rowIdx % 2 === 0
                              ? (teamIdx === 0 ? '#3f3f5e' : teamIdx === 1 ? '#2d4a3e' : teamIdx === 2 ? '#4a3d2d' : '#2d3e4a')
                              : (teamIdx === 0 ? '#353548' : teamIdx === 1 ? '#253931' : teamIdx === 2 ? '#3d3226' : '#25333d')
                          }}>
                          <div className="truncate">{row.ghiChu || ''}</div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </div>
  )
}



