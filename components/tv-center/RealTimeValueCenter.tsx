"use client"

import { useState, useEffect } from "react"
import { CenterTVGroup } from "@/types/api.types"
import { getPercentageColor } from "@/lib/utils"
import { useProductionStore } from "@/stores/productionStore"

interface RealTimeValueCenterProps {
  group: CenterTVGroup
  field: keyof CenterTVGroup
  className?: string
  style?: React.CSSProperties
  formatNumber?: boolean
  isPercentage?: boolean
  isCheckColor?: boolean
  isTargetHour?: boolean
}

export default function RealTimeValueCenter({
  group,
  field,
  className = "",
  style = {},
  formatNumber = true,
  isPercentage = false,
  isCheckColor = false,
  isTargetHour = false,
}: RealTimeValueCenterProps) {
  const [displayValue, setDisplayValue] = useState<number | string>(0)
  const [isUpdating, setIsUpdating] = useState(false)
  const [targetColor, setTargetColor] = useState<string>("")

  useEffect(() => {
    const value = group[field]
    if (typeof value === "number") {
      setDisplayValue(value)
    } else {
      setDisplayValue(value || 0)
    }

    setIsUpdating(true)
    const timer = setTimeout(() => setIsUpdating(false), 300)
    return () => clearTimeout(timer)
  }, [group, field])

  useEffect(() => {
    // For hourly target cells compute percent = value / keHoachGio * 100 and set color
    if (isTargetHour) {
      const keHoachGio = Number(group.keHoachGio) || 0
      const val = Number(group[field]) || 0
      let percent = 0
      if (keHoachGio > 0) percent = (val / keHoachGio) * 100

      const color = getPercentageColor(percent)
      // compose classes similar to other components
      setTargetColor(`${color.bgColor} ${color.textColor} ${color.borderColor || ''} ${color.shadow || ''}`.trim())
    }
    
    // For isCheckColor (e.g., %HT SLTH) - color based on the value itself
    if (isCheckColor && !isTargetHour) {
      const percent = Number(displayValue) || 0
      const color = getPercentageColor(percent)
      setTargetColor(`${color.bgColor} ${color.textColor} ${color.borderColor || ''} ${color.shadow || ''}`.trim())
    }
  }, [isTargetHour, isCheckColor, group, field, displayValue])

  const getFormattedValue = () => {
    if (isPercentage) {
      return `${Math.round(Number(displayValue) || 0)}`
    }

    if (formatNumber && typeof displayValue === "number") {
      return displayValue.toLocaleString()
    }

    return displayValue || "0"
  }

  const formattedValue = getFormattedValue()

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

    // Check if it's today
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const isToday = now >= todayStart;

    if (isToday) {
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

  // Render hourly target cell as pill with color background
  if (isTargetHour) {
    // Hide if slot not yet reachable and value is 0
    // const timeSlotMap: any = {
    //   h830: 8 * 60 + 30,
    //   h930: 9 * 60 + 30,
    //   h1030: 10 * 60 + 30,
    //   h1130: 11 * 60 + 30,
    //   h1330: 13 * 60 + 30,
    //   h1430: 14 * 60 + 30,
    //   h1530: 15 * 60 + 30,
    //   h1630: 16 * 60 + 30,
    //   h1800: 18 * 60 + 0,
    //   h1900: 19 * 60 + 0,
    //   h2000: 20 * 60 + 0,
    // }
    // const slotKey = field as string
    // const now = new Date()
    // const currentMinutes = now.getHours() * 60 + now.getMinutes()
    // const slotMinutes = timeSlotMap[slotKey]

    // // If slot not yet passed and value is zero -> render empty cell to keep layout
    // if ((slotMinutes === undefined || currentMinutes < slotMinutes) && Number(displayValue) === 0) {
    //   return (
    //     <div className={`w-full h-full flex items-center justify-center ${className}`} style={style}>
    //       <div className="w-full h-10 bg-transparent" />
    //     </div>
    //   )
    // }

    const hasTimePassed = hasTimeSlotPassed(field as string);

    // If time slot has NOT passed yet AND value is 0, don't render
    if (!hasTimePassed && displayValue === 0) {
      return null;
    }

    // show colored pill
    return (
      <div className={`w-full h-full flex items-center justify-center ${className}`} style={style}>
        <div className={`${targetColor} font-black flex items-center justify-center w-full h-full`}>
          <span style={{ fontSize: 'clamp(0.85rem, 1.6vw, 1.6rem)' }}>{formattedValue}</span>
        </div>
      </div>
    )
  }

  // Default rendering for non-hourly fields
  return (
    <div 
      className={`${className} ${isUpdating ? 'animate-pulse' : ''} ${isCheckColor ? targetColor : ''} flex items-center justify-center
        `} 
      style={style}
    >
      <span className="font-black">{formattedValue}{isPercentage && typeof displayValue === 'number' ? '%' : ''}</span>
    </div>
  )
}