"use client"

import { useState, useEffect } from "react"
import { useProductionStore } from "@/stores/productionStore"

import type { ProductionData } from "@/stores/productionStore"
import { getPercentageColor, getPercentageColorForError, getPercentageColorForQCError, getPercentageColorForRFT } from "@/lib/utils"
import Image from "next/image"
import UpArrowIcon from "../UpArrowIcon"
import DownArrowIcon from "../DownArrowIcon"

interface RealTimeValueProps {
  field: keyof ProductionData
  className?: string
  formatNumber?: boolean
  label?: string
  fixedNumber?: number
  showIcon?: boolean
  isPercentage?: boolean
  isCheckColor?: boolean
  disabledBgColor?: boolean
  isTargetHour?: boolean
  largeTimer?: boolean
  isCheckErrorColor?: boolean
  hasErrorColor?: boolean
  isCritical?: boolean
  lineData?: any // NEW: Pass CD line data directly instead of using store
}

export default function RealTimeValueCD({
  field,
  className = "",
  formatNumber = true,
  label = "",
  fixedNumber,
  showIcon = false,
  isPercentage = false,
  isCheckColor = false,
  isTargetHour = false,
  largeTimer = false,
  disabledBgColor = false,
  isCheckErrorColor = false,
  hasErrorColor = false,
  isCritical = false,
  lineData, // NEW: CD line data from parent
}: RealTimeValueProps) {
  const [displayValue, setDisplayValue] = useState<number | string>(0)
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateCount, setUpdateCount] = useState(0)
  const [targetColor, setTargetColor] = useState<string>("")

  // Optimize: Use single selector with memoization
  const storeValue = useProductionStore((state) => state.data[field as keyof typeof state.data])
  const hourlyData = useProductionStore((state) => state.data.hourlyData)
  const renderKey = useProductionStore((state) => state.data._renderKey)

  useEffect(() => {
    // For hourly fields, extract sanluong data from backend structure
    const hourFields = [
      "h830", "h930", "h1030", "h1130", "h1330", "h1430", "h1530", "h1630", "h1800", "h1900", "h2000"
    ];

    if (hourFields.includes(field) && isTargetHour) {
      // Priority 1: Use lineData if provided (for CD layout with multiple lines)
      if (lineData?.hourlyData?.hourly) {
        const timeSlot = field as string;
        const sanluong = lineData.hourlyData.hourly[timeSlot]?.sanluong || 0;
        
        setDisplayValue(sanluong);
        setUpdateCount((prev) => prev + 1);
        setIsUpdating(true);
        const timer = setTimeout(() => setIsUpdating(false), 500);
        return () => clearTimeout(timer);
      }
      
      // Priority 2: Fallback to store data (for single line view)
      if (hourlyData?.hourly && typeof hourlyData.hourly === 'object') {
        const timeSlot = field as string;
        const slotData = hourlyData.hourly[timeSlot as keyof typeof hourlyData.hourly];
        
        if (slotData && typeof slotData === 'object' && 'sanluong' in slotData) {
          const sanluong = Number((slotData as any).sanluong) || 0;
          setDisplayValue(sanluong);
          setUpdateCount((prev) => prev + 1);
          setIsUpdating(true);
          const timer = setTimeout(() => setIsUpdating(false), 500);
          return () => clearTimeout(timer);
        }
      }

      // If no hourly data, don't show anything
      setDisplayValue(0);
      return;
    }

    // Handle other fields - PRIORITY: lineData over store (for CD multiple lines)
    if (lineData && field in lineData) {
      const value = lineData[field];
      setDisplayValue(typeof value === 'object' ? JSON.stringify(value) : value || 0);
      setUpdateCount((prev) => prev + 1);
      setIsUpdating(true);
      const timer = setTimeout(() => setIsUpdating(false), 500);
      return () => clearTimeout(timer);
    }

    // Default behavior for other fields (fallback to store)
    if (typeof storeValue === "object") {
      setDisplayValue(JSON.stringify(storeValue))
    } else {
      setDisplayValue(storeValue || 0)
    }

    setUpdateCount((prev) => prev + 1)
    setIsUpdating(true)
    const timer = setTimeout(() => setIsUpdating(false), 500)

    return () => clearTimeout(timer)
  }, [storeValue, hourlyData, renderKey, field, isTargetHour, lineData])

  useEffect(() => {
    const hourFields = [
      "h830", "h930", "h1030", "h1130", "h1330", "h1430", "h1530", "h1630", "h1800", "h1900", "h2000"
    ];

    if (isTargetHour && hourFields.includes(field)) {
      let percent: number = 0;
      let sanluong: number = 0;

      // Priority 1: Use lineData if provided (for CD layout with multiple lines)
      if (lineData?.hourlyData?.hourly) {
        const timeSlot = field as string;
        const slotData = lineData.hourlyData.hourly[timeSlot];

        if (slotData && typeof slotData === 'object') {
          percent = Number(slotData.percentage) || 0;
          sanluong = Number(slotData.sanluong) || 0;
        }
      } else {
        // Priority 2: Fallback to store data (for single line view)
        const hourlyData = useProductionStore.getState().data.hourlyData;
        if (hourlyData?.hourly && typeof hourlyData.hourly === 'object') {
          const timeSlot = field as string;
          const slotData = hourlyData.hourly[timeSlot as keyof typeof hourlyData.hourly];

          if (slotData && typeof slotData === 'object' && 'percentage' in slotData) {
            percent = Number(slotData.percentage) || 0;
            sanluong = Number((slotData as any).sanluong) || 0;
          }
        }
      }

      // Only apply color if sanluong > 0 (có sản xuất thực tế giờ này)
      if (sanluong > 0 && percent > 0) {
        const color = getPercentageColor(percent);
        setTargetColor(`${color.bgColor} ${color.textColor}`);
      } else {
        setTargetColor('bg-white text-black'); // Default white if no data
      }
    }
    
    // Handle phanTramHt color when isCheckColor is true
    if (isCheckColor && field === 'phanTramHt') {
      // Get percentage value from lineData or store
      let percentValue = 0;
      if (lineData && 'phanTramHt' in lineData) {
        percentValue = Number(lineData.phanTramHt) || 0;
      } else {
        percentValue = Number(storeValue) || 0;
      }
      
      const color = getPercentageColor(percentValue);
      setTargetColor(`${color.bgColor} ${color.textColor}`);
    }
  }, [isTargetHour, isCheckColor, field, storeValue, hourlyData, lineData])

  // Helper function to check if time slot has passed
  const hasTimeSlotPassed = (timeSlot: string): boolean => {
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTimeInMinutes = currentHours * 60 + currentMinutes;

    // Map time slots to minutes since midnight
    const timeSlotMap: { [key: string]: number } = {
      "h830": 8 * 60 + 30,
      "h930": 9 * 60 + 30,
      "h1030": 10 * 60 + 30,
      "h1130": 11 * 60 + 30,
      "h1330": 13 * 60 + 30,
      "h1430": 14 * 60 + 30,
      "h1530": 15 * 60 + 30,
      "h1630": 16 * 60 + 30,
      "h1800": 18 * 60 + 0,
      "h1900": 19 * 60 + 0,
      "h2000": 20 * 60 + 0,
    };

    const slotTimeInMinutes = timeSlotMap[timeSlot];
    if (slotTimeInMinutes === undefined) return false;

    // Detect if data is from past day by checking if ANY time slot has cumulative > 0
    const hourlyData = useProductionStore.getState().data.hourlyData;
    let isPastDay = false;
    
    if (hourlyData?.cumulative && typeof hourlyData.cumulative === 'object') {
      // Check all time slots - if ANY slot has cumulative > 0, it's past day data
      const allTimeSlots = Object.keys(timeSlotMap);
      
      const hasAnyCumulative = allTimeSlots.some(slot => {
        const cumulativeValue = hourlyData.cumulative?.[slot as keyof typeof hourlyData.cumulative];
        return typeof cumulativeValue === 'number' && cumulativeValue > 0;
      });
      
      isPastDay = hasAnyCumulative;
    }

    if (!isPastDay) {
      // Current day: use normal time-based logic
      return currentTimeInMinutes >= slotTimeInMinutes;
    } else {
      // Past day: check based on tglv to determine max time slot to display
      const tglv = useProductionStore.getState().data.tglv || 0;
      
      // Determine max time slot based on tglv
      let maxTimeSlot: string;
      if (tglv === 8) {
        maxTimeSlot = "h1630"; // 8 hours: show up to 16:30
      } else if (tglv === 9.5) {
        maxTimeSlot = "h1800"; // 9.5 hours: show up to 18:00
      } else if (tglv === 11) {
        maxTimeSlot = "h2000"; // 11 hours: show up to 20:00
      } else {
        // Default: show all time slots
        return true;
      }

      // Check if current time slot is within max allowed
      const maxTimeInMinutes = timeSlotMap[maxTimeSlot];
      return slotTimeInMinutes <= maxTimeInMinutes;
    }
  }

  const getFormattedValue = () => {
    if (field === "image") {
      return displayValue
    }

    if (field === "phanTramHt" || field === "phanTramHtPph" || field === "rft" || field === "phanTramGiao") {
      return `${Math.round(Number(displayValue) || 0)}`
    }

    if (field === "diffLdCoMatLayout") {
      if (typeof displayValue === "number" && displayValue > 0) {
        return `+${displayValue.toLocaleString()}`
      } else if (typeof displayValue === "number" && displayValue < 0) {
        return `-${Math.abs(displayValue).toLocaleString()}`
      } else {
        return "0"
      }
    }

    if (formatNumber && typeof displayValue === "number") {
      // const formatted = (displayValue / 1000).toLocaleString('en-US', {
      //   minimumFractionDigits: 3,
      //   maximumFractionDigits: 3,
      // });
      // return formatted;
      if (Math.abs(displayValue) >= 1000) {
        return (displayValue / 1000).toLocaleString('en-US', {
          minimumFractionDigits: 3,
          maximumFractionDigits: 3,
        });
      } else {
        return displayValue.toLocaleString('en-US', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 3,
        });
      }
    }

    return displayValue || "0"
  }

  const formattedValue = getFormattedValue()

  const getFlashClass = () => {
    return isUpdating ? "bg-yellow-400 text-black animate-pulse" : ""
  }

  const getTrendDisplay = () => {
    if (!showIcon || typeof displayValue !== "number") {
      return null
    }

    const diff = displayValue
    if (diff > 0) {
      return {
        icon: <UpArrowIcon />,
        color: "text-green-500",
        bgColor: "bg-green-100",
      }
    } else if (diff < 0) {
      return {
        icon: <DownArrowIcon />,
        color: "text-red-500",
        bgColor: "bg-red-100",
      }
    }
    return null
  }

  const trendDisplay = getTrendDisplay()

  // // Don't render anything if showIcon is true and value is 0
  // if (showIcon && displayValue === 0) {
  //   return null
  // }

  // Check if time slot has passed - only hide if time slot NOT passed AND value is 0
  if (isTargetHour) {
    // Check if sanluong = 0 for this time slot (hide empty cells)
    const hourFields = [
      "h830", "h930", "h1030", "h1130", "h1330", "h1430", "h1530", "h1630", "h1800", "h1900", "h2000"
    ];
    
    if (hourFields.includes(field)) {
      let sanluong = 0;
      
      // Get sanluong from lineData or store
      if (lineData?.hourlyData?.hourly?.[field]) {
        sanluong = Number(lineData.hourlyData.hourly[field].sanluong) || 0;
      } else {
        const hourlyData = useProductionStore.getState().data.hourlyData;
        if (hourlyData?.hourly?.[field as keyof typeof hourlyData.hourly]) {
          const slotData = hourlyData.hourly[field as keyof typeof hourlyData.hourly];
          if (slotData && typeof slotData === 'object' && 'sanluong' in slotData) {
            sanluong = Number((slotData as any).sanluong) || 0;
          }
        }
      }
      
      // If sanluong = 0, return empty cell (white background)
      if (sanluong === 0) {
        return null;
      }
    }

    const hasTimePassed = hasTimeSlotPassed(field as string);

    // If time slot has NOT passed yet AND value is 0, don't render
    if (!hasTimePassed && displayValue === 0) {
      return null;
    }

    // If time slot HAS passed AND value is 0, show with red color (handled by targetColor)
    // If time slot HAS passed AND value > 0, show with appropriate color
  }

  if (field === "image" && typeof displayValue === "string" && displayValue !== "") {
    // Validate if displayValue is a valid URL
    const isValidUrl = displayValue.startsWith('http://') || displayValue.startsWith('https://') || displayValue.startsWith('/');

    if (!isValidUrl || displayValue === "#N/A") {
      // Show placeholder if invalid URL
      return (
        <div
          className={`flex items-center justify-center metric-card-violet p-1 backdrop-blur-sm shadow-xl w-full h-full`}
          style={{
            overflow: "hidden",
            maxWidth: "100%",
            maxHeight: "100%",
            aspectRatio: "1"
          }}
        >
          <Image
            src="/window.svg"
            alt="COACH"
            className="object-cover rounded-md"
            width={120}
            height={120}
            priority
            style={{
              width: "100%",
              height: "100%",
              maxWidth: "clamp(4rem, 8vw, 7.5rem)",
              maxHeight: "clamp(4rem, 8vw, 7.5rem)",
              objectFit: "cover",
              flexShrink: 0
            }}
          />
        </div>
      );
    }

    return (
      <div
        className={`flex items-center justify-center metric-card-violet p-1 backdrop-blur-sm shadow-xl w-full h-full`}
        style={{
          overflow: "hidden",
          maxWidth: "100%",
          maxHeight: "100%",
          aspectRatio: "1"
        }}
      >
        <Image
          src={displayValue}
          alt="COACH"
          className="object-cover rounded-md"
          width={120}
          height={120}
          priority
          style={{
            width: "100%",
            height: "100%",
            maxWidth: "clamp(4rem, 8vw, 7.5rem)",
            maxHeight: "clamp(4rem, 8vw, 7.5rem)",
            objectFit: "cover",
            flexShrink: 0
          }}
          onError={(e) => {
            const target = e.target as HTMLImageElement
            const parent = target.parentElement
            if (parent) {
              parent.className = `${className} ${getFlashClass()} transition-all duration-300 rounded-lg px-2 py-1 flex items-center justify-center bg-gray-800/80 border-2 border-cyan-400/50 w-full h-full`
              parent.innerHTML = '<span class="text-cyan-300 text-sm font-bold">COACH</span>'
              parent.style.maxWidth = "clamp(4rem, 8vw, 8rem)"
              parent.style.maxHeight = "clamp(4rem, 8vw, 8rem)"
            }
          }}
        />
      </div>
    )
  }

  if (field === "diffLdCoMatLayout") {
    if (formattedValue !== "0" && Number(displayValue) !== 0) {
      return (
        <div className="flex items-center justify-center rounded-sm
  bg-gradient-to-tr from-[#090013] via-[#140028] to-[#1a0038]
  text-white font-semibold px-2 py-1
  border border-[#c084fc]
  shadow-[0_0_15px_4px_rgba(192,132,252,0.8),0_0_6px_2px_rgba(255,255,255,0.1)]"
        >
          <div
            // style={{ fontSize: "clamp(1rem,2.2vw,1.8rem)" }}
            style={{ fontSize: "clamp(1.6rem,2.8vw,3rem)" }}
            className="font-black text-white text-center leading-none"
          >
            {formattedValue}
          </div>
        </div>
      )
    } else {
      return null
    }
  }

  if (largeTimer && field === "nhipsx") {
    return (
      <div className={`absolute inset-0 flex items-center justify-center pointer-events-none ${className}`}>
        <div
          className="bg-green-500 rounded-full flex items-center justify-center"
          style={{
            width: "clamp(6rem, 62%, 12rem)",
            height: "clamp(6rem, 62%, 12rem)",
          }}
        >
          <span className="text-black font-black" style={{ fontSize: "clamp(1.75rem, 4vw, 5rem)" }}>
            {formattedValue}"
          </span>
        </div>
      </div>
    )
  }

  const colorScheme = isCheckColor
    ? field === "rft"
      ? getPercentageColorForRFT(Number(displayValue))
      : getPercentageColor(Number(displayValue))
    : isCheckErrorColor
      ? getPercentageColorForError(Number(displayValue))
      : hasErrorColor
        ? getPercentageColorForQCError(Number(displayValue), isCritical)
        : null


  const { bgColor, textColor, borderColor, shadow } = colorScheme || { bgColor: "", textColor: "" }

  return (
    <div
      className={`${className} ${getFlashClass()} transition-all duration-500 rounded flex items-center justify-center
      ${showIcon && trendDisplay ? `${trendDisplay.color} rounded` : ""}
      ${(isCheckColor || isCheckErrorColor) && colorScheme && !targetColor
          ? !disabledBgColor
            ? `${bgColor} ${textColor} ${borderColor} rounded-md border ${shadow} w-full h-full`
            : `${colorScheme.textColorNew} rounded-none`
          : ""
        }
      ${hasErrorColor && colorScheme ? `${bgColor} ${textColor} ${borderColor} border ${shadow} p-1 w-full h-full` : ""}
      ${(isTargetHour || (isCheckColor && targetColor)) && targetColor ? `${targetColor} w-full h-full border border-white/20 shadow-lg rounded-none` : ""}
    `}
      key={`${field}-${renderKey}-${updateCount}`}
    >
      {showIcon && typeof displayValue === "number" && trendDisplay && (
        <span className={`${trendDisplay.color}`}>
          {/* <trendDisplay.icon className="w-12 h-12" /> */}
          {trendDisplay.icon}
        </span>
      )}
      {fixedNumber !== undefined && typeof displayValue === "number" && displayValue !== 0
        ? (() => {
          const fixed = displayValue.toFixed(fixedNumber);
          // Remove trailing zeros and unnecessary decimal point
          // e.g., 92.00 -> 92, 0.10 -> 0.1, 92.50 -> 92.5
          return parseFloat(fixed).toString();
        })()
        : formattedValue}
      {isPercentage && typeof displayValue === "number" && !formattedValue.toString().includes("%") ? "%" : ""}
    </div>
  )
}
