"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import TVCenter from "@/components/tv-center/TVCenter"

function TVCenterContent() {
  const searchParams = useSearchParams()
  // Normalize factory to uppercase (TS1, TS2, TS3)
  const rawFactory = searchParams.get("factory") || "TS1"
  const factory = rawFactory.trim().toUpperCase()
  
  // Normalize line to string
  const rawLine = searchParams.get("line") || "1"
  const line = rawLine.trim()

  return (
    <TVCenter
      key={`center-tv-${factory}-${line}`}
      factory={factory}
      line={line}
      refreshInterval={30000}
      tvMode={true}
    />
  )
}

export default function TVCenterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center">
        <div className="text-white text-2xl flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          Loading Center TV...
        </div>
      </div>
    }>
      <TVCenterContent />
    </Suspense>
  )
}