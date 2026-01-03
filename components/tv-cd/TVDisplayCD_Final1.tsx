"use client"

import { useState, useEffect, useMemo } from "react"
import { RefreshCw } from 'lucide-react'
import { useProductionDataCD } from "@/hooks/useProductionDataCD"
import useTime from "@/hooks/useTime"
import { getPercentageColor, getPercentageTextColor } from "@/lib/utils"

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

  // Map backend data to display format - MUST be before early returns (Rules of Hooks)
  const mockData = useMemo(() => {
    if (!realtimeData || !realtimeData.allLines || realtimeData.allLines.length === 0) {
      // Fallback to empty structure
      return {
        factory: realtimeData?.factory || 'TS1',
        summary: {
          ldCoMat: 0,
          ldDinhBien: 0,
          khNgay: 0,
          lkkh: 0,
          lkth: 0,
          tonMay: 0,
          ncdv: 0,
          dbcu: 0,
          day1Top: 0,
          day2Top: 0,
          day3Top: 0,
          day1Bottom: 0,
          day2Bottom: 0,
          day3Bottom: 0,
          dbNgay: 0,
        },
        teams: []
      };
    }

    // Map 4 CD lines from backend (allLines contains 4 CD parent rows)
    const teams = realtimeData.allLines.map((cdLine: any, idx: number) => {
      // Map subRows to products array - each subRow is a product/team row
      const products = (cdLine.subRows || []).map((subRow: any) => ({
        tglv: subRow.tglv || 0,               // AT (45): TGLV (team number in subrow)
        khNgay: subRow.targetNgay || 0,       // T (19): TARGET NGÀY
        lkkh: subRow.lkkh || 0,               // AL (37): LKKH
        lkth: subRow.lkth || 0,               // V (21): LKTH
        maHang: subRow.maHang || '',          // E (4): MÃ HÀNG
        mau: '',                               // Màu (optional, not in backend)
        tonMay: subRow.tonMay || 0,           // AX (49): TỒN MAY
        ncdv: subRow.ncdv || 0,               // AU (46): NCĐV
        dbcu: subRow.dbcu || 0,               // AV (47): ĐBCỨ
        phanTramDapUng: subRow.phanTramDapUng || 0, // AW (48): %ĐÁP ỨNG
        day1Top: subRow.nc1ntt || 0,         // AY (50): NC1NTT - Top value
        day1Bottom: subRow.db1ntt || 0, // Bottom value (if exists)
        day2Top: subRow.nc2ntt || 0,         // AZ (51): NC2NTT - Top value
        day2Bottom: subRow.db2ntt || 0, // Bottom value (if exists)
        day3Top: subRow.nc3ntt || 0,         // BA (52): NC3NTT - Top value
        day3Bottom: subRow.db3ntt || 0, // Bottom value (if exists)
        ghiChu: subRow.note || 0,            // BB (53): NOTE
        dbNgay: subRow.dbNgay || 0,          // BC (54): ĐB NGÀY
      }));

      return {
        id: `CD${idx + 1}`,                    // CD1, CD2, CD3, CD4
        teamNumber: String(cdLine.tglv || ''), // AT (45): TGLV from parent row (or first subrow)
        ldCoMat: cdLine.ldCoMat || 0,          // M (12): LĐ CÓ MẶT
        ldDinhBien: cdLine.ldLayout || 0,      // N (13): LĐ LAYOUT (định biên)
        khNgay: cdLine.targetNgay || 0,        // T (19): TARGET NGÀY (parent row - optional)
        products: products
      };
    });

    // Calculate summary from all teams' products
    const summary = {
      ldCoMat: teams.reduce((sum: number, team: any) => sum + team.ldCoMat, 0),
      ldDinhBien: teams.reduce((sum: number, team: any) => sum + team.ldDinhBien, 0),
      khNgay: teams.reduce((sum: number, team: any) =>
        sum + team.products.reduce((pSum: number, p: any) => pSum + p.khNgay, 0), 0),
      lkkh: teams.reduce((sum: number, team: any) =>
        sum + team.products.reduce((pSum: number, p: any) => pSum + p.lkkh, 0), 0),
      lkth: teams.reduce((sum: number, team: any) =>
        sum + team.products.reduce((pSum: number, p: any) => pSum + p.lkth, 0), 0),
      tonMay: teams.reduce((sum: number, team: any) =>
        sum + team.products.reduce((pSum: number, p: any) => pSum + p.tonMay, 0), 0),
      ncdv: teams.reduce((sum: number, team: any) =>
        sum + team.products.reduce((pSum: number, p: any) => pSum + p.ncdv, 0), 0),
      dbcu: teams.reduce((sum: number, team: any) =>
        sum + team.products.reduce((pSum: number, p: any) => pSum + p.dbcu, 0), 0),
      day1Top: teams.reduce((sum: number, team: any) =>
        sum + team.products.reduce((pSum: number, p: any) => pSum + (p.day1Top || 0), 0), 0),
      day2Top: teams.reduce((sum: number, team: any) =>
        sum + team.products.reduce((pSum: number, p: any) => pSum + (p.day2Top || 0), 0), 0),
      day3Top: teams.reduce((sum: number, team: any) =>
        sum + team.products.reduce((pSum: number, p: any) => pSum + (p.day3Top || 0), 0), 0),
      day1Bottom: teams.reduce((sum: number, team: any) =>
        sum + team.products.reduce((pSum: number, p: any) => pSum + (p.day1Bottom || 0), 0), 0),
      day2Bottom: teams.reduce((sum: number, team: any) =>
        sum + team.products.reduce((pSum: number, p: any) => pSum + (p.day2Bottom || 0), 0), 0),
      day3Bottom: teams.reduce((sum: number, team: any) =>
        sum + team.products.reduce((pSum: number, p: any) => pSum + (p.day3Bottom || 0), 0), 0),
      dbNgay: teams.reduce((sum: number, team: any) =>
        sum + team.products.reduce((pSum: number, p: any) => pSum + (p.dbNgay || 0), 0), 0),
    };

    return {
      factory: realtimeData.factory || 'TS1',
      summary,
      teams
    };
  }, [realtimeData]);

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
  const totalRows = mockData.teams.reduce((sum: number, team: any) => {
    const actualRows = Math.min(team.products.length, 7);
    const displayRows = Math.max(actualRows, 2); // Minimum 2 rows per team
    return sum + displayRows;
  }, 0);

  // Dynamic font sizes based on TOTAL row count (max 28 rows)
  const getFontSizes = (totalRowCount: number) => {
    // Base font size optimized for 20 rows display - larger fonts due to less content
    const baseFontMultiplier = Math.max(0.75, 1.55 - (totalRowCount * 0.025)); // Increased base for 20 rows max

    return {
      base: `clamp(${baseFontMultiplier * 0.8}rem, ${baseFontMultiplier * 1.5}vw + 0.2rem, ${baseFontMultiplier * 1.4}rem)`,
      medium: `clamp(${baseFontMultiplier * 0.9}rem, ${baseFontMultiplier * 1.6}vw + 0.2rem, ${baseFontMultiplier * 1.5}rem)`,
      small: `clamp(${baseFontMultiplier * 0.75}rem, ${baseFontMultiplier * 1.4}vw + 0.15rem, ${baseFontMultiplier * 1.25}rem)`,
      ldCoMat: `clamp(${baseFontMultiplier * 0.9}rem, ${baseFontMultiplier * 1.7}vw + 0.25rem, ${baseFontMultiplier * 1.6}rem)`,
      label: `clamp(${baseFontMultiplier * 0.85}rem, ${baseFontMultiplier * 1.6}vw + 0.2rem, ${baseFontMultiplier * 1.4}rem)`,
      maHang: `clamp(${baseFontMultiplier * 0.75}rem, ${baseFontMultiplier * 1.4}vw + 0.15rem, ${baseFontMultiplier * 1.25}rem)`,
      ghiChu: `clamp(${baseFontMultiplier * 0.65}rem, ${baseFontMultiplier * 1.2}vw + 0.1rem, ${baseFontMultiplier * 1.1}rem)`,
      padding: 'px-1 py-0.5'
    };
  };

  function getColorDBNgay(value: number) {
    if (value <= 2.5) { return 'lkth-text-critical'; }
    if (value <= 3.5) { return 'lkth-text-warning'; }
    return 'lkth-text-good';
  }
// const gridTemplateColumns = '0.4fr 0.5fr 0.95fr 0.5fr 0.5fr 0.5fr 0.5fr 0.5fr 0.5fr 0.5fr 0.65fr 0.65fr 0.65fr 0.65fr';
  const gridTemplateColumns = '0.4fr 0.5fr 0.95fr 0.5fr 0.5fr 0.5fr 0.5fr 0.5fr 0.5fr 0.5fr 0.65fr 0.65fr 0.65fr 0.65fr';

  const fontSizes = getFontSizes(totalRows);

  // Dynamic font size for Ghi Chú based on text length (wrap-text effect)
  const getGhiChuFontSize = (text: string, baseFontSize: string) => {
    if (!text || text.length === 0) return baseFontSize;

    const length = text.length;

    // Thresholds for font size adjustment
    if (length <= 20) {
      // Short text: use base font size
      return baseFontSize;
    } else if (length <= 40) {
      // Medium text: reduce by 15%
      return baseFontSize.replace(/(\d+\.?\d*)/g, (match) => {
        const value = parseFloat(match);
        return (value * 0.7).toFixed(2);
      });
    } else if (length <= 60) {
      // Long text: reduce by 25%
      return baseFontSize.replace(/(\d+\.?\d*)/g, (match) => {
        const value = parseFloat(match);
        return (value * 0.6).toFixed(2);
      });
    } else {
      // Very long text: reduce by 35%
      return baseFontSize.replace(/(\d+\.?\d*)/g, (match) => {
        const value = parseFloat(match);
        return (value * 0.5).toFixed(2);
      });
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-slate-900 text-white"
      style={{ letterSpacing: '0.05em' }}
    >
      {/* Row 1: Logo and Header - Fixed height */}
      <div className="w-full flex flex-row items-center gap-3 px-3 flex-shrink-0 bg-slate-800/50" style={{ height: '4.5vh' }}>
        <div
          className="relative bg-white/95 rounded backdrop-blur-sm shadow-lg flex items-center justify-center flex-shrink-0"
          style={{
            width: "clamp(2rem, 3vh, 2.5rem)",
            height: "clamp(2rem, 3vh, 2.5rem)",
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
        <div className="flex items-center justify-between gap-3 flex-1 min-w-0">
          <span className="text-white font-black drop-shadow-lg whitespace-nowrap"
            style={{ fontSize: "clamp(0.9rem, 2vw + 0.1rem, 1.6rem)", letterSpacing: '0.1em' }}>
            {`${mockData.factory}`}
          </span>
          <div className="flex-1 min-w-0 flex items-center justify-center">
            <div
              style={{ fontSize: "clamp(0.85rem, 1.8vw + 0.05rem, 1.5rem)", letterSpacing: '0.05em' }}
              className="font-black text-white leading-tight drop-shadow-lg text-center"
            >
              THEO DÕI ĐHSX CHẶT DÁN & TIẾN ĐỘ ĐỒNG BỘ CUNG ỨNG ĐẦU VÀO CHO MAY
            </div>
          </div>
          <div className="w-32"
            suppressHydrationWarning={true}
            style={{ fontSize: "clamp(0.9rem, 2vw + 0.1rem, 1.6rem)", letterSpacing: '0.1em' }}
          >
            {formattedTime}
          </div>
        </div>
      </div>

      {/* Row 2: Table Header - Fixed height */}
      <div className="flex-shrink-0 border border-yellow-400 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 shadow-xl" style={{ height: '5.5vh' }}>
        <div className="header-cd grid h-full" style={{ gridTemplateColumns }}>
          <div className="border-r-1 border-yellow-400 text-center font-black flex items-center justify-center text-yellow-300 drop-shadow-md overflow-hidden px-1" style={{ fontSize: 'clamp(0.65rem, 1.3vw + 0.1rem, 1rem)' }}>
            <span className="leading-tight">TỔ</span>
          </div>

          <div className="border-r-1 border-yellow-400 text-center font-black flex flex-col items-center justify-center text-yellow-300 drop-shadow-md overflow-hidden px-1" style={{ fontSize: 'clamp(0.65rem, 1.3vw + 0.1rem, 1rem)' }}>
            <span className="leading-tight">TGLV</span>
            <span className="leading-tight text-xs">CM/ĐB</span>
          </div>

          <div className="border-r-1 border-yellow-400 text-center font-black flex items-center justify-center text-yellow-300 drop-shadow-md overflow-hidden px-1" style={{ fontSize: 'clamp(0.75rem, 1.5vw + 0.15rem, 1.15rem)' }}>
            <span className="leading-tight">STYLE - MÀU</span>
          </div>

          <div className="border-r-1 border-yellow-400 text-center font-black flex items-center justify-center text-yellow-300 drop-shadow-md overflow-hidden" style={{ fontSize: 'clamp(0.8rem, 1.6vw + 0.15rem, 1.25rem)' }}>
            <span className="leading-tight">KH NGÀY</span>
          </div>

          <div className="border-r-1 border-yellow-400 text-center font-black flex items-center justify-center text-yellow-300 drop-shadow-md overflow-hidden" style={{ fontSize: 'clamp(0.8rem, 1.6vw + 0.15rem, 1.25rem)' }}>
            <span>LKKH</span>
          </div>

          <div className="border-r-1 border-yellow-400 text-center font-black flex items-center justify-center text-yellow-300 drop-shadow-md overflow-hidden" style={{ fontSize: 'clamp(0.8rem, 1.6vw + 0.15rem, 1.25rem)' }}>
            <span>LKTH</span>
          </div>

          <div className="border-r-1 border-yellow-400 text-center font-black flex items-center justify-center text-yellow-300 drop-shadow-md overflow-hidden" style={{ fontSize: 'clamp(0.8rem, 1.6vw + 0.15rem, 1.25rem)' }}>
            <span className="leading-tight">TỒN MAY</span>
          </div>

           <div className="border-r-1 border-yellow-400 text-center font-black flex items-center justify-center text-yellow-300 drop-shadow-md overflow-hidden" style={{ fontSize: 'clamp(0.8rem, 1.6vw + 0.15rem, 1.25rem)' }}>
            <span className="leading-tight">ĐB NGÀY</span>
          </div>

          <div className="border-r-1 border-yellow-400 text-center font-black flex items-center justify-center text-yellow-300 drop-shadow-md overflow-hidden px-1" style={{ fontSize: 'clamp(0.7rem, 1.4vw + 0.1rem, 1.1rem)' }}>
            <span className="leading-tight">NCĐV</span>
          </div>

          <div className="border-r-1 border-yellow-400 text-center font-black flex items-center justify-center text-yellow-300 drop-shadow-md overflow-hidden px-1" style={{ fontSize: 'clamp(0.7rem, 1.4vw + 0.1rem, 1.1rem)' }}>
            <span className="leading-tight">ĐBCỨ</span>
          </div>

          <div className="border-r-1 border-yellow-400 text-center font-black flex items-center justify-center text-yellow-300 drop-shadow-md overflow-hidden" style={{ fontSize: 'clamp(0.8rem, 1.6vw + 0.15rem, 1.25rem)' }}>
            <span className="leading-tight">%Đ.ỨNG</span>
          </div>

          {nextDays.map((day, idx) => (
            <div key={idx} className="border-r-1 border-yellow-400 text-center font-black flex items-center justify-center text-yellow-300 drop-shadow-md overflow-hidden" style={{ fontSize: 'clamp(0.8rem, 1.6vw + 0.15rem, 1.25rem)' }}>
              <span>{day}</span>
            </div>
          ))}

          {/* <div className="text-center font-black flex items-center justify-center text-yellow-300 drop-shadow-md overflow-hidden" style={{ fontSize: 'clamp(0.8rem, 1.6vw + 0.15rem, 1.25rem)' }}>
            <span>GHI CHÚ</span>
          </div> */}
        </div>
      </div>

      {/* Row 3: Summary Row (LINE CD) - Fixed height - DOUBLED */}
      <div className="flex-shrink-0 border-2 border-yellow-500 bg-gradient-to-r from-yellow-200 via-yellow-100 to-yellow-200 shadow-2xl"
        style={{ height: '5.5vh', fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif', letterSpacing: '0.2em' }}>
        <div className="grid h-full header-cd" style={{ gridTemplateColumns }}>
          <div className="border-r-1 border-yellow-500 text-center font-black flex items-center justify-center text-slate-900 overflow-hidden" style={{ fontSize: fontSizes.base }}>LINE</div>
          <div className="border-r-1 border-yellow-500 text-center font-black text-slate-900 overflow-hidden" style={{ fontSize: 'clamp(0.8rem, 1.6vw + 0.15rem, 1.25rem)' }}>
            <div className="flex flex-col h-full items-center justify-center py-1">
              <div className="leading-tight">
                {mockData.summary.ldDinhBien}/{mockData.summary.ldCoMat}
              </div>
              {mockData.summary.ldCoMat !== mockData.summary.ldDinhBien && (
                <div className={`text-sm leading-tight font-bold ${mockData.summary.ldCoMat > mockData.summary.ldDinhBien ? 'text-green-600' : 'text-red-600'}`}>
                  ({mockData.summary.ldCoMat > mockData.summary.ldDinhBien ? '+' : ''}{mockData.summary.ldCoMat - mockData.summary.ldDinhBien})
                </div>
              )}
            </div>
          </div>
          <div className="border-r-1 border-yellow-500 text-center font-black flex items-center justify-center text-slate-900 overflow-hidden" style={{ fontSize: fontSizes.base }}>-</div>
          <div className="border-r-1 border-yellow-500 text-center font-black flex items-center justify-center text-slate-900 overflow-hidden" style={{ fontSize: fontSizes.base }}>{formatNumber(mockData.summary.khNgay)}</div>
          <div className="border-r-1 border-yellow-500 text-center font-black flex items-center justify-center text-slate-900 overflow-hidden" style={{ fontSize: fontSizes.base }}>{formatNumber(mockData.summary.lkkh)}</div>
          <div className={`border-r-1 border-yellow-500 text-center font-black flex items-center justify-center overflow-hidden ${mockData.summary.lkth > 0
            ? `${getPercentageColor((mockData.summary.lkth / mockData.summary.lkkh) * 100).bgColor} ${getPercentageColor((mockData.summary.lkth / mockData.summary.lkkh) * 100).textColor}` : 'text-slate-900'}`} style={{ fontSize: fontSizes.base }}>{formatNumber(mockData.summary.lkth)}</div>
          <div className="border-r-1 border-yellow-500 text-center font-black flex items-center justify-center text-slate-900 overflow-hidden" style={{ fontSize: fontSizes.base }}>{formatNumber(mockData.summary.tonMay)}</div>
          <div className="border-r-1 border-yellow-500 text-center font-black flex items-center justify-center text-slate-900 overflow-hidden" style={{ fontSize: fontSizes.base }}>-</div>
          <div className="border-r-1 border-yellow-500 text-center font-black flex items-center justify-center text-slate-900 overflow-hidden" style={{ fontSize: fontSizes.base }}>{formatNumber(mockData.summary.ncdv)}</div>
          <div className="border-r-1 border-yellow-500 text-center font-black flex items-center justify-center text-slate-900 overflow-hidden" style={{ fontSize: fontSizes.base }}>{formatNumber(mockData.summary.dbcu)}</div>
          <div className={`border-r-1 border-yellow-500 text-center font-black flex items-center justify-center overflow-hidden ${mockData.summary.ncdv > 0 ? `${getPercentageColor((mockData.summary.dbcu / mockData.summary.ncdv) * 100).bgColor} ${getPercentageColor((mockData.summary.dbcu / mockData.summary.ncdv) * 100).textColor}` : 'text-slate-900'}`} style={{ fontSize: fontSizes.base }}>{mockData.summary.ncdv > 0 ? Math.round((mockData.summary.dbcu / mockData.summary.ncdv) * 100) : 0}%</div>

          <div className="border-r-1 border-yellow-500 text-center font-black flex items-center justify-center text-slate-900 overflow-hidden" style={{ fontSize: fontSizes.base }}>
            {formatNumber(mockData.summary.day1Top)}
          </div>
           <div className="border-r-1 border-yellow-500 text-center font-black flex items-center justify-center text-slate-900 overflow-hidden" style={{ fontSize: fontSizes.base }}>
            {formatNumber(mockData.summary.day2Top)}
          </div>
           <div className="border-r-1 border-yellow-500 text-center font-black flex items-center justify-center text-slate-900 overflow-hidden" style={{ fontSize: fontSizes.base }}>
            {formatNumber(mockData.summary.day3Top)}
          </div>

          {/* Day 1 - Diagonal split cell for summary */}
          {/* <div className="border-r-1 border-yellow-500 overflow-hidden p-0" style={{ position: 'relative' }}>
            <div className="diagonal-split-cell">
              <svg className="diagonal-line-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                <line x1="0" y1="100" x2="100" y2="0" stroke="rgba(0, 0, 0, 0.3)" strokeWidth="1" />
              </svg>
              <div className="diagonal-value-top text-slate-900 font-black" style={{ fontSize: fontSizes.base }}>
                {formatNumber(mockData.summary.day1Top)}
              </div>
              <div className="diagonal-value-bottom text-slate-900 font-black" style={{ fontSize: fontSizes.base }}>
                {formatNumber(mockData.summary.day1Bottom)}
              </div>
            </div>
          </div> */}

          {/* Day 2 - Diagonal split cell for summary */}
          {/* <div className="border-r-1 border-yellow-500 overflow-hidden p-0" style={{ position: 'relative' }}>
            <div className="diagonal-split-cell">
              <svg className="diagonal-line-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                <line x1="0" y1="100" x2="100" y2="0" stroke="rgba(0, 0, 0, 0.3)" strokeWidth="1" />
              </svg>
              <div className="diagonal-value-top text-slate-900 font-black" style={{ fontSize: fontSizes.base }}>
                {formatNumber(mockData.summary.day2Top)}
              </div>
              <div className="diagonal-value-bottom text-slate-900 font-black" style={{ fontSize: fontSizes.base }}>
                {formatNumber(mockData.summary.day2Bottom)}
              </div>
            </div>
          </div> */}

          {/* Day 3 - Diagonal split cell for summary */}
          {/* <div className="border-r-1 border-yellow-500 overflow-hidden p-0" style={{ position: 'relative' }}>
            <div className="diagonal-split-cell">
              <svg className="diagonal-line-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                <line x1="0" y1="100" x2="100" y2="0" stroke="rgba(0, 0, 0, 0.3)" strokeWidth="1" />
              </svg>
              <div className="diagonal-value-top text-slate-900 font-black" style={{ fontSize: fontSizes.base }}>
                {formatNumber(mockData.summary.day3Top)}
              </div>
              <div className="diagonal-value-bottom text-slate-900 font-black" style={{ fontSize: fontSizes.base }}>
                {formatNumber(mockData.summary.day3Bottom)}
              </div>
            </div>
          </div> */}

          {/* <div className="text-center font-black flex items-center justify-center text-slate-900 overflow-hidden" style={{ fontSize: 'clamp(1.2rem, 2.4vw, 2rem)' }}>-</div> */}
        </div>
      </div>

      {/* Rows 4-15: Table Body - Using HTML table with rowspan */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {mockData.teams.map((team: any, teamIdx: number) => {
          const borderColor = teamIdx === 0 ? 'border-violet-500' : teamIdx === 1 ? 'border-emerald-500' : teamIdx === 2 ? 'border-amber-500' : 'border-sky-500';
          const teamHeaderBg = teamIdx === 0 ? 'bg-violet-400' : teamIdx === 1 ? 'bg-emerald-400' : teamIdx === 2 ? 'bg-amber-400' : 'bg-sky-400';
          const teamRowBg = teamIdx === 0 ? 'bg-slate-800/95' : teamIdx === 1 ? 'bg-slate-800/90' : teamIdx === 2 ? 'bg-slate-800/85' : 'bg-slate-800/80';
          const actualRowCount = Math.min(team.products.length, 7);
          const displayRowCount = Math.max(actualRowCount, 2); // Minimum 2 rows for TỔ/TGLV display

          // Calculate height - ensure proportional distribution based on display rows
          // Total available height = 84vh (100vh - 4.5vh header - 5.5vh table header - 6vh summary)
          const availableHeight = 86;
          const heightPercentage = (displayRowCount / totalRows) * availableHeight;

          return (
            <div key={teamIdx} className={`border-l-1 border-r-1 ${teamIdx < mockData.teams.length - 1 ? `border-b-1` : 'border-b-1'} ${borderColor} ${teamIdx === 0 ? `border-t-1 ${borderColor}` : `border-t-1 ${borderColor}`}`} style={{ height: `${heightPercentage}vh` }}>
              <table className="w-full h-full border-collapse" style={{ tableLayout: 'fixed' }}>
                <colgroup>
                  <col style={{ width: '4%' }} />
                  <col style={{ width: '5%' }} />
                  <col style={{ width: '9.5%' }} />
                  <col style={{ width: '5%' }} />
                  <col style={{ width: '5%' }} />
                  <col style={{ width: '5%' }} />
                  <col style={{ width: '5%' }} />
                  <col style={{ width: '5%' }} />
                  <col style={{ width: '5%' }} />
                  <col style={{ width: '5%' }} />
                  <col style={{ width: '6.5%' }} />
                  <col style={{ width: '6.5%' }} />
                  <col style={{ width: '6.5%' }} />
                  <col style={{ width: '6.5%' }} />
                </colgroup>
                <tbody>
                  {team.products.slice(0, 7).map((row: any, rowIdx: number) => {
                    // Calculate %Đ.ỨNG với xử lý trường hợp chia cho 0
                    const dapUng = (row.ncdv > 0) ? (row.dbcu / row.ncdv) * 100 : 0;
                    const progressColor = getPercentageColor(Number(dapUng));
                    const isLastRow = rowIdx === team.products.slice(0, 7).length - 1;
                    const innerBorderClass = isLastRow ? '' : 'border-b-[0.5px]';

                    // Calculate rowspan for TGLV and CM/ĐB to center them vertically
                    const halfRows = Math.ceil(displayRowCount / 2);

                    return (
                      <tr key={rowIdx} className={teamRowBg}>
                        {/* TỔ (CD1, CD2, CD3, CD4) - Column 1 with rowspan */}
                        {rowIdx === 0 && (
                          <td rowSpan={displayRowCount} className={`border-r-1 ${borderColor} text-center font-black overflow-hidden ${teamHeaderBg}`} style={{ fontSize: fontSizes.label }}>
                            <div className="flex items-center justify-center h-full text-white">
                              {team.id}
                            </div>
                          </td>
                        )}

                        {/* Column 2: TGLV (top half with rowspan) + CM/ĐB (bottom half with rowspan) */}
                        {rowIdx === 0 ? (
                          // First row: Show TGLV with rowspan for top half
                          <td rowSpan={halfRows} className={`border-r-[0.5px] ${borderColor} text-center font-bold overflow-hidden border-b-[0.5px]`}
                            style={{
                              fontSize: fontSizes.small,
                              backgroundColor: teamIdx === 0 ? '#3f3f5e' : teamIdx === 1 ? '#2d4a3e' : teamIdx === 2 ? '#4a3d2d' : '#2d3e4a'
                            }}>
                            <div className="flex items-center justify-center h-full text-white">
                              {row.tglv || team.teamNumber}h
                            </div>
                          </td>
                        ) : rowIdx === halfRows ? (
                          // Middle row: Show CM/ĐB with rowspan for bottom half
                          <td rowSpan={displayRowCount - halfRows} className={`border-r-[0.5px] ${borderColor} text-center font-bold overflow-hidden`}
                            style={{
                              fontSize: fontSizes.small,
                              backgroundColor: teamIdx === 0 ? '#353548' : teamIdx === 1 ? '#253931' : teamIdx === 2 ? '#3d3226' : '#25333d'
                            }}>
                            <div className="flex flex-col h-full items-center justify-center gap-1 py-1">
                              <div className="leading-tight text-white font-extrabold">
                                {team.ldCoMat}/{team.ldDinhBien}
                              </div>
                              {team.ldCoMat !== team.ldDinhBien && (
                                <div className={`text-xs leading-tight font-bold ${team.ldCoMat > team.ldDinhBien ? 'text-green-300' : 'text-red-300'}`}>
                                  ({team.ldCoMat > team.ldDinhBien ? '+' : ''}{team.ldCoMat - team.ldDinhBien})
                                </div>
                              )}
                            </div>
                          </td>
                        ) : null /* Other rows are covered by rowspan */}

                        {/* MÃ HÀNG/MÀU */}
                        <td className={`border-r-[0.5px] ${borderColor} ${innerBorderClass} ${borderColor} text-center font-black text-white overflow-hidden align-middle ${fontSizes.padding}`}
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
                        <td className={`border-r-[0.5px] ${borderColor} ${innerBorderClass} ${borderColor} text-center font-black text-white overflow-hidden align-middle ${fontSizes.padding}`}
                          style={{
                            fontSize: fontSizes.base,
                            backgroundColor: rowIdx % 2 === 0
                              ? (teamIdx === 0 ? '#3f3f5e' : teamIdx === 1 ? '#2d4a3e' : teamIdx === 2 ? '#4a3d2d' : '#2d3e4a')
                              : (teamIdx === 0 ? '#353548' : teamIdx === 1 ? '#253931' : teamIdx === 2 ? '#3d3226' : '#25333d')
                          }}>
                          {row.khNgay}
                        </td>

                        {/* LKKH */}
                        <td className={`border-r-[0.5px] ${borderColor} ${innerBorderClass} ${borderColor} text-center font-black overflow-hidden align-middle ${fontSizes.padding}`}
                          style={{
                            fontSize: fontSizes.base,
                            backgroundColor: rowIdx % 2 === 0
                              ? (teamIdx === 0 ? '#3f3f5e' : teamIdx === 1 ? '#2d4a3e' : teamIdx === 2 ? '#4a3d2d' : '#2d3e4a')
                              : (teamIdx === 0 ? '#353548' : teamIdx === 1 ? '#253931' : teamIdx === 2 ? '#3d3226' : '#25333d')
                          }}>
                          {row.lkkh}
                        </td>

                        {/* LKTH - Only show color if value > 0 */}
                        <td className={`border-r-[0.5px] ${borderColor} ${innerBorderClass} ${borderColor} text-center font-black overflow-hidden align-middle ${fontSizes.padding}
                         ${row.lkth > 0
                            ? `${getPercentageTextColor((row.lkth / row.lkkh) * 100).textColor} ${getPercentageTextColor((row.lkth / row.lkkh) * 100).textColor}` : 'text-white'}`}
                          style={{
                            fontSize: fontSizes.medium,
                            backgroundColor: rowIdx % 2 === 0
                              ? (teamIdx === 0 ? '#3f3f5e' : teamIdx === 1 ? '#2d4a3e' : teamIdx === 2 ? '#4a3d2d' : '#2d3e4a')
                              : (teamIdx === 0 ? '#353548' : teamIdx === 1 ? '#253931' : teamIdx === 2 ? '#3d3226' : '#25333d')
                          }}>
                          {row.lkth}
                        </td>

                        {/* TỒN MAY */}
                        <td className={`border-r-[0.5px] ${borderColor} ${innerBorderClass} ${borderColor} text-center font-black text-white overflow-hidden align-middle ${fontSizes.padding}`}
                          style={{
                            fontSize: fontSizes.base,
                            backgroundColor: rowIdx % 2 === 0
                              ? (teamIdx === 0 ? '#3f3f5e' : teamIdx === 1 ? '#2d4a3e' : teamIdx === 2 ? '#4a3d2d' : '#2d3e4a')
                              : (teamIdx === 0 ? '#353548' : teamIdx === 1 ? '#253931' : teamIdx === 2 ? '#3d3226' : '#25333d')
                          }}>
                          {row.tonMay}
                        </td>

                        {/* ĐB NGÀY */}
                        <td className={`border-r-[0.5px] ${borderColor} ${innerBorderClass} ${borderColor}
                        ${getColorDBNgay(row.dbNgay)}
                        text-center font-black text-white overflow-hidden align-middle ${fontSizes.padding}`}
                          style={{
                            fontSize: fontSizes.base,
                            backgroundColor: rowIdx % 2 === 0
                              ? (teamIdx === 0 ? '#3f3f5e' : teamIdx === 1 ? '#2d4a3e' : teamIdx === 2 ? '#4a3d2d' : '#2d3e4a')
                              : (teamIdx === 0 ? '#353548' : teamIdx === 1 ? '#253931' : teamIdx === 2 ? '#3d3226' : '#25333d')
                          }}>
                          {row.dbNgay}
                        </td>

                        {/* NC ĐẦU VÀO */}
                        <td className={`border-r-[0.5px] ${borderColor} ${innerBorderClass} ${borderColor} text-center font-black text-white overflow-hidden align-middle ${fontSizes.padding}`}
                          style={{
                            fontSize: fontSizes.base,
                            backgroundColor: rowIdx % 2 === 0
                              ? (teamIdx === 0 ? '#3f3f5e' : teamIdx === 1 ? '#2d4a3e' : teamIdx === 2 ? '#4a3d2d' : '#2d3e4a')
                              : (teamIdx === 0 ? '#353548' : teamIdx === 1 ? '#253931' : teamIdx === 2 ? '#3d3226' : '#25333d')
                          }}>
                          {row.ncdv}
                        </td>

                        {/* ĐB CUNG ỨNG */}
                        <td className={`border-r-[0.5px] ${borderColor} ${innerBorderClass} ${borderColor} text-center font-black text-white overflow-hidden align-middle ${fontSizes.padding}`}
                          style={{
                            fontSize: fontSizes.base,
                            backgroundColor: rowIdx % 2 === 0
                              ? (teamIdx === 0 ? '#3f3f5e' : teamIdx === 1 ? '#2d4a3e' : teamIdx === 2 ? '#4a3d2d' : '#2d3e4a')
                              : (teamIdx === 0 ? '#353548' : teamIdx === 1 ? '#253931' : teamIdx === 2 ? '#3d3226' : '#25333d')
                          }}>
                          {row.dbcu}
                        </td>

                        {/* % ĐÁP ỨNG */}
                        <td className={`border-r-[0.5px] ${borderColor} ${innerBorderClass} ${borderColor} ${progressColor.bgColor} ${progressColor.textColor} text-center font-black overflow-hidden align-middle ${fontSizes.padding}`}
                          style={{
                            fontSize: fontSizes.base,
                            backgroundColor: dapUng < 0
                              ? (rowIdx % 2 === 0
                                ? (teamIdx === 0 ? '#3f3f5e' : teamIdx === 1 ? '#2d4a3e' : teamIdx === 2 ? '#4a3d2d' : '#2d3e4a')
                                : (teamIdx === 0 ? '#353548' : teamIdx === 1 ? '#253931' : teamIdx === 2 ? '#3d3226' : '#25333d'))
                              : undefined
                          }}>
                          {isNaN(dapUng) || !isFinite(dapUng) ? '0%' : `${Math.round(dapUng)}%`}
                        </td>

                         <td className={`border-r-[0.5px] ${borderColor} ${innerBorderClass} ${borderColor}
                           ${row.day1Bottom > 0 && row.day1Top > 0 ? getPercentageTextColor((row.day1Bottom / row.day1Top) * 100).textColor : 'text-white'}
                         text-center font-black text-white overflow-hidden align-middle ${fontSizes.padding}`}
                          style={{
                            fontSize: fontSizes.medium,
                            backgroundColor: rowIdx % 2 === 0
                              ? (teamIdx === 0 ? '#3f3f5e' : teamIdx === 1 ? '#2d4a3e' : teamIdx === 2 ? '#4a3d2d' : '#2d3e4a')
                              : (teamIdx === 0 ? '#353548' : teamIdx === 1 ? '#253931' : teamIdx === 2 ? '#3d3226' : '#25333d')
                          }}>
                          {row.day1Top}
                        </td>

                         <td className={`border-r-[0.5px] ${borderColor} ${innerBorderClass} ${borderColor}
                       ${row.day1Bottom > 0 && row.day1Top > 0 ? getPercentageTextColor((row.day1Bottom / row.day1Top) * 100).textColor : 'text-white'} 
                         text-center font-black text-white overflow-hidden align-middle ${fontSizes.padding}`}
                          style={{
                            fontSize: fontSizes.medium,
                            backgroundColor: rowIdx % 2 === 0
                              ? (teamIdx === 0 ? '#3f3f5e' : teamIdx === 1 ? '#2d4a3e' : teamIdx === 2 ? '#4a3d2d' : '#2d3e4a')
                              : (teamIdx === 0 ? '#353548' : teamIdx === 1 ? '#253931' : teamIdx === 2 ? '#3d3226' : '#25333d')
                          }}>
                          {row.day2Top}
                        </td>

                         <td className={`border-r-[0.5px] ${borderColor} ${innerBorderClass} ${borderColor}
                           ${row.day1Bottom > 0 && row.day1Top > 0 ? getPercentageTextColor((row.day1Bottom / row.day1Top) * 100).textColor : 'text-white'}
                         text-center font-black text-white overflow-hidden align-middle ${fontSizes.padding}`}
                          style={{
                            fontSize: fontSizes.medium,
                            backgroundColor: rowIdx % 2 === 0
                              ? (teamIdx === 0 ? '#3f3f5e' : teamIdx === 1 ? '#2d4a3e' : teamIdx === 2 ? '#4a3d2d' : '#2d3e4a')
                              : (teamIdx === 0 ? '#353548' : teamIdx === 1 ? '#253931' : teamIdx === 2 ? '#3d3226' : '#25333d')
                          }}>
                          {row.day3Top}
                        </td>

                        {/* Day 1 - Diagonal split cell */}
                        {/* <td className={`border-r-[0.5px] ${borderColor} ${innerBorderClass} ${borderColor} text-center font-black text-white overflow-hidden align-middle p-0`}
                          style={{
                            backgroundColor: rowIdx % 2 === 0
                              ? (teamIdx === 0 ? '#3f3f5e' : teamIdx === 1 ? '#2d4a3e' : teamIdx === 2 ? '#4a3d2d' : '#2d3e4a')
                              : (teamIdx === 0 ? '#353548' : teamIdx === 1 ? '#253931' : teamIdx === 2 ? '#3d3226' : '#25333d')
                          }}>
                          <div className="diagonal-split-cell">
                            <svg className="diagonal-line-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                              <line x1="0" y1="100" x2="100" y2="0" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="0.5" />
                            </svg>
                            <div className="diagonal-value-top text-white" style={{ fontSize: fontSizes.base }}>
                              {row.day1Top}
                            </div>
                            <div className={`diagonal-value-bottom ${row.day1Bottom > 0 && row.day1Top > 0 ? getPercentageTextColor((row.day1Bottom / row.day1Top) * 100).textColor : 'text-white'}`} style={{ fontSize: fontSizes.base }}>
                              {row.day1Bottom}
                            </div>
                          </div>
                        </td> */}

                        {/* Day 2 - Diagonal split cell */}
                        {/* <td className={`border-r-[0.5px] ${borderColor} ${innerBorderClass} ${borderColor} text-center font-black text-white overflow-hidden align-middle p-0`}
                          style={{
                            backgroundColor: rowIdx % 2 === 0
                              ? (teamIdx === 0 ? '#3f3f5e' : teamIdx === 1 ? '#2d4a3e' : teamIdx === 2 ? '#4a3d2d' : '#2d3e4a')
                              : (teamIdx === 0 ? '#353548' : teamIdx === 1 ? '#253931' : teamIdx === 2 ? '#3d3226' : '#25333d')
                          }}>
                          <div className="diagonal-split-cell">
                            <svg className="diagonal-line-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                              <line x1="0" y1="100" x2="100" y2="0" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="0.5" />
                            </svg>
                            <div className="diagonal-value-top text-white" style={{ fontSize: fontSizes.base }}>
                              {row.day2Top}
                            </div>
                            <div className={`diagonal-value-bottom ${row.day2Bottom > 0 && row.day2Top > 0 ? getPercentageTextColor((row.day2Bottom / row.day2Top) * 100).textColor : 'text-white'}`} style={{ fontSize: fontSizes.base }}>
                              {row.day2Bottom}
                            </div>
                          </div>
                        </td> */}

                        {/* Day 3 - Diagonal split cell */}
                        {/* <td className={`border-r-[0.5px] ${borderColor} ${innerBorderClass} ${borderColor} text-center font-black text-white overflow-hidden align-middle p-0`}
                          style={{
                            backgroundColor: rowIdx % 2 === 0
                              ? (teamIdx === 0 ? '#3f3f5e' : teamIdx === 1 ? '#2d4a3e' : teamIdx === 2 ? '#4a3d2d' : '#2d3e4a')
                              : (teamIdx === 0 ? '#353548' : teamIdx === 1 ? '#253931' : teamIdx === 2 ? '#3d3226' : '#25333d')
                          }}>
                          <div className="diagonal-split-cell">
                            <svg className="diagonal-line-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                              <line x1="0" y1="100" x2="100" y2="0" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="0.5" />
                            </svg>
                            <div className="diagonal-value-top text-white" style={{ fontSize: fontSizes.base }}>
                              {row.day3Top}
                            </div>
                            <div className={`diagonal-value-bottom ${row.day3Bottom > 0 && row.day3Top > 0 ? getPercentageTextColor((row.day3Bottom / row.day3Top) * 100).textColor : 'text-white'}`} style={{ fontSize: fontSizes.base }}>
                              {row.day3Bottom}
                            </div>
                          </div>
                        </td> */}

                        {/* GHI CHÚ */}
                        {/* <td className={`${innerBorderClass} ${borderColor} text-left font-black text-white overflow-hidden align-middle ${fontSizes.padding} px-2`}
                          style={{
                            fontSize: getGhiChuFontSize(row.ghiChu || '', fontSizes.ghiChu),
                            lineHeight: '1.3',
                            wordBreak: 'break-word',
                            whiteSpace: 'normal',
                            backgroundColor: rowIdx % 2 === 0
                              ? (teamIdx === 0 ? '#3f3f5e' : teamIdx === 1 ? '#2d4a3e' : teamIdx === 2 ? '#4a3d2d' : '#2d3e4a')
                              : (teamIdx === 0 ? '#353548' : teamIdx === 1 ? '#253931' : teamIdx === 2 ? '#3d3226' : '#25333d')
                          }}>
                          <div className="line-clamp-3">{row.ghiChu || ''}</div>
                        </td> */}
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



