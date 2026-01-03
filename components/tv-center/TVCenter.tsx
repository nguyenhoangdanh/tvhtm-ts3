"use client"

import { useState, useEffect } from "react"
import { RefreshCw } from "lucide-react"
import RealTimeValueCenter from "./RealTimeValueCenter"
import { useCenterTVData } from "@/hooks/useCenterTVData"
import useTime from "@/hooks/useTime"

interface TVCenterProps {
  factory: string
  line: string
  refreshInterval?: number
  tvMode?: boolean
}

export default function TVCenter({
  factory,
  line,
  refreshInterval = 30000,
  tvMode = false,
}: TVCenterProps) {
  const { minutes, hours } = useTime({})
  const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`

  const { data, loading, error, connected, refresh, groups, summary } = useCenterTVData({
    factory,
    line,
    enableRealtime: true,
    tvMode,
  })

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
    if (!connected && refreshInterval > 0) {
      const interval = setInterval(refresh, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [connected, refresh, refreshInterval])

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center">
        <div className="text-white text-2xl flex items-center gap-3">
          <RefreshCw className="animate-spin" size={32} />
          Đang tải dữ liệu Center TV...
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

  if (!data || !groups || groups.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-2xl">Không có dữ liệu cho {factory} LINE {line}</div>
      </div>
    )
  }


  return (
    <div
      className="h-screen w-screen text-white font-bold overflow-hidden bg-black"
      style={{
        display: "grid",
        gridTemplateRows: "clamp(80px, 12vh, 120px) 1fr",
        gap: "0.5rem",
        padding: "0.25rem",
      }}
    >
      {/* Header Section */}
      <div className="flex items-center px-2 py-1 bg-gradient-to-r from-gray-900 to-black border-b-4 border-green-500 gap-6">

        {/* Logo Section - Reduced to col-span-1 */}
          <div className="col-span-1 h-full flex flex-row items-center justify-between py-2 min-w-0">
            <div className="flex flex-row justify-center items-center gap-0.5">
              <button
                className="relative bg-white/95 rounded backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-white hover:scale-105 transition-all duration-200 cursor-pointer group"
                style={{
                  width: "clamp(2.2rem, 4vw, 4.4rem)",
                  height: "clamp(2.2rem, 4vw, 4.4rem)",
                  aspectRatio: "1"
                }}
                title="Chọn Line Sản Xuất"
              >
                <img
                  src="/coach.png"
                  alt="COACH Logo"
                  className="w-full h-full object-contain filter drop-shadow-xl group-hover:drop-shadow-2xl transition-all"
                  loading="eager"
                />
              </button>
              <div
                className="relative bg-white/95 rounded backdrop-blur-sm shadow-lg flex items-center justify-center"
                style={{
                  width: "clamp(2.2rem, 4vw, 4.4rem)",
                  height: "clamp(2.2rem, 4vw, 4.4rem)",
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

            </div>
            <div className="text-center px-2 py-1 flex flex-row items-center justify-center gap-6">
              <div
                style={{ fontSize: "clamp(1.8rem,2.8vw,3rem)" }}
                className="font-black text-white leading-none"
                suppressHydrationWarning={true}
              >
                {formattedTime}
              </div>
              <div className="text-center">
            <div className="text-white text-center uppercase tracking-wider"
              style={{ fontSize: "clamp(0.6rem, 1vw, 1.2rem)" }}>
              TGLV
            </div>
            <div className="bg-white text-black px-2 py-1 rounded font-black"
              style={{ fontSize: "clamp(1rem, 2vw, 2.8rem)" }}>
              {data?.data?.summary?.tglv || 0}
            </div>
          </div>
            </div>
          </div>
        {/* Left: Title */}
        <div className="flex items-center gap-1"
        style={{ fontSize:"clamp(1.8rem,2.8vw,3rem)"}}
        >
          <div className="bg-green-600 px-2 py-1 rounded text-white font-black uppercase tracking-wider">
            TRUNG TÂM ĐỒNG BỘ
          </div>
          <div className="bg-pink-600 px-2 py-1 rounded text-white font-black">
            LINE {line}
          </div>
          <div className="bg-pink-600 px-2 py-1 rounded text-white font-black">
            {factory}
          </div>
        </div>

        {/* Right: TGLV & Time */}
        {/* <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="text-white uppercase tracking-wider"
              style={{ fontSize: "clamp(0.6rem, 1vw, 1.2rem)" }}>
              TGLV
            </div>
            <div className="bg-white text-black px-2 py-1 rounded font-black"
              style={{ fontSize: "clamp(1rem, 2vw, 2.8rem)" }}>
              {data?.tglv || 0}
            </div>
          </div>
          <div className="text-white font-black"
            style={{ fontSize: "clamp(1.2rem, 2.5vw, 3.5rem)" }}
            suppressHydrationWarning={true}>
            {formattedTime}
          </div>
        </div> */}
      </div>

      {/* Main Content - 3 Groups (Quai-Sơn-Lót) */}
      <div className="flex flex-col gap-2 overflow-hidden px-2">
        {groups.map((group, index) => (
          <div
            key={index}
            className={`flex-1 border-4 border-white rounded-lg overflow-hidden ${index === 0 ? 'glass-card-group2' : index === 1 ? 'glass-card-group1' : 'glass-card-group3'}`}
            style={{
              display: "grid",
              gridTemplateRows: "auto 1fr",
              minHeight: 0,
            }}
          >
            {/* Group Header Row */}
            <div className=" tv-center grid grid-cols-6 text-white border-b-1 border-white w-full"
              style={{ fontSize: "clamp(0.65rem, 1.3vw, 1.8rem)" }}>
              <div className="text-center py-1 font-black border-r-1">
                MỤC TIÊU SL NGÀY
              </div>
              <div className="text-center py-1 font-black border-r-1  ">
                LK K.HOẠCH
              </div>
              <div className="text-center py-1 font-black border-r-1 ">
                LK T.HIỆN
              </div>
              <div className="text-center py-1 font-black border-r-1  ">
                %HT SLTH
              </div>
              <div className="text-center py-1 font-black border-r-1 ">
                LK GIAO MAY
              </div>
              <div className="text-center py-1 font-black">
                TIẾN ĐỘ ĐÁP ỨNG
              </div>
            </div>

            {/* Group Data Row */}
            <div className=" tv-center grid grid-cols-6 items-center justify-center gap-2"
              style={{
                // background: index === 0 ? 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)' 
                //   : index === 1 ? 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)'
                //   : 'linear-gradient(135deg, #dc2626 0%, #f87171 100%)',
              }}>
              <div className="text-center metric-card-group2 w-11/12 ml-2.5">
                <RealTimeValueCenter 
                  group={group}
                  field="keHoachNgay"
                  className="font-black"
                  style={{ fontSize: "clamp(1.2rem, 2.8vw, 4.5rem)" }}
                />
              </div>
              

              <div className="text-center metric-card-group2 w-11/12 ml-2.5">
                <RealTimeValueCenter 
                  group={group}
                  field="lkKh"
                  className="font-black "
                  style={{ fontSize: "clamp(1.2rem, 2.8vw, 4.5rem)" }}
                />
              </div>
              <div className="text-center metric-card-group2 w-11/12 ml-2.5">
                <RealTimeValueCenter 
                  group={group}
                  field="lkTh"
                  className="font-black "
                  style={{ fontSize: "clamp(1.2rem, 2.8vw, 4.5rem)" }}
                />
              </div>
              <div className="text-center metric-card-group2 w-11/12 ml-2.5">
                <div className="flex items-center justify-center">
                  <RealTimeValueCenter 
                    group={group}
                    field="phanTramHt"
                    isPercentage={true}
                    isCheckColor={true}
                    className="font-black w-full"
                    style={{ fontSize: "clamp(1.2rem, 2.8vw, 4.5rem)" }}
                  />
                </div>
              </div>
              <div className="text-center metric-card-group2 w-11/12 ml-2.5">
                <RealTimeValueCenter 
                  group={group}
                  field="soLuongGiaoMay"
                  className="font-black "
                  style={{ fontSize: "clamp(1.2rem, 2.8vw, 4.5rem)" }}
                />
              </div>
              <div className="text-center metric-card-group2 w-11/12 ml-2.5">
                <RealTimeValueCenter 
                  group={group}
                  field="tienDoApUng"
                  isPercentage={true}
                  className="font-black"
                  style={{ fontSize: "clamp(1.2rem, 2.8vw, 4.5rem)" }}
                />
              </div>
            </div>

            {/* Hourly Timeline for this group */}
            <div className="tv-center grid grid-cols-12 border-t-1 border-white text-white" style={{ minHeight: '48px' }}>
              <div className="text-center py-1 font-black border-r border-white/30 bg-cyan-800 flex flex-col items-center justify-center"
                style={{ fontSize: "clamp(0.6rem, 1.2vw, 1.6rem)" }}>
                <div className="uppercase">TARGET  GIỜ</div>
                <div className="text-white font-black mt-0.5"
                  style={{ fontSize: "clamp(1rem, 2vw, 2.6rem)" }}>
                  {group.keHoachGio || 0}
                </div>
              </div>
              {[
                { time: "8H30", field: "h830" },
                { time: "9H30", field: "h930" },
                { time: "10H30", field: "h1030" },
                { time: "11H30", field: "h1130" },
                { time: "13H30", field: "h1330" },
                { time: "14H30", field: "h1430" },
                { time: "15H30", field: "h1530" },
                { time: "16H30", field: "h1630" },
                { time: "18H", field: "h1800" },
                { time: "19H", field: "h1900" },
                { time: "20H", field: "h2000" },
              ].map(({ time, field }) => (
                <div key={field} className=" flex flex-col h-full hourly-timeline-item">
                   <div className="text-center text-white font-bold py-1 hourly-timeline-header border-slate-600/50 border-1 bg-slate-900/50"
                    style={{ fontSize: "clamp(0.6rem, 1.2vw, 1.6rem)" }}>
                    {time}
                  </div>
                  <div className="h-full flex-1 flex items-center justify-center hourly-timeline-content border-slate-600/50 border-2 border-t-0 bg-slate-900/50">
                   
                    <RealTimeValueCenter 
                      group={group}
                      field={field as any}
                      isTargetHour={true}
                      className="w-full h-full flex items-center justify-center"
                      style={{ fontSize: "clamp(0.8rem, 1.8vw, 2.5rem)" }}
                    />
                  </div>
                </div>
              ))}
              {/* <div className="text-center h-full font-black border-r border-white/30 bg-slate-900/50 flex flex-col items-center justify-center"
                style={{ fontSize: "clamp(0.6rem, 1.2vw, 1.6rem)" }}>
                <div className="py-1 bg-cyan-800 w-full">%HT</div>
                 <RealTimeValueCenter 
                      group={group}
                      field="phanTramHt"
                      isCheckColor={true}
                      className="w-full h-full flex items-center justify-center"
                      style={{ fontSize: "clamp(0.8rem, 1.8vw, 2.5rem)" }}
                    />
              </div> */}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}