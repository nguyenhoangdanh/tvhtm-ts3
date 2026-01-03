"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import apiService from "@/services/api.service";
import websocketService from "@/services/websocket.service";
import autoRefreshService from "@/services/auto-refresh.service";
import { useProductionStore } from "@/stores/productionStore";

// ✅ Helper function to extract factory from CD code
function extractFactoryFromCDCode(code: string): string {
  if (!code || !code.includes("CD")) return "TS1";

  const match = code.match(/CD(\d+)/);
  if (!match) return "TS1";

  const lineNumber = parseInt(match[1]);

  // KVHB07CD16-19 = TS1
  // KVHB07CD20-23 = TS2
  // KVHB07CD24-27 = TS3
  if (lineNumber >= 16 && lineNumber <= 19) return "TS1";
  if (lineNumber >= 20 && lineNumber <= 23) return "TS2";
  if (lineNumber >= 24 && lineNumber <= 27) return "TS3";

  return "TS1";
}

// ✅ Helper function to get all CD codes for same factory
function getAllCDCodesForFactory(code: string): string[] {
  const factory = extractFactoryFromCDCode(code);

  const factoryCodeMap: { [key: string]: string[] } = {
    TS1: ["KVHB07CD16", "KVHB07CD17", "KVHB07CD18", "KVHB07CD19"],
    TS2: ["KVHB07CD20", "KVHB07CD21", "KVHB07CD22", "KVHB07CD23"],
    TS3: ["KVHB07CD24", "KVHB07CD25", "KVHB07CD26", "KVHB07CD27"],
  };

  return factoryCodeMap[factory] || [code];
}

interface UseProductionDataCDOptions {
  maChuyenLine?: string;
  factory?: string;
  line?: string;
  team?: string;
  enableRealtime?: boolean;
  tvMode?: boolean;
}

export function useProductionDataCD({
  maChuyenLine,
  factory,
  line,
  team,
  enableRealtime = true,
  tvMode = false,
}: UseProductionDataCDOptions) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  const updateDataStore = useProductionStore((state) => state.updateData); // Renamed to avoid conflict
  const forceRefresh = useProductionStore((state) => state.forceRefresh);

  const lastFetchRef = useRef<number>(0);
  const DEBOUNCE_MS = 1000;

  const fetchData = useCallback(async () => {
    const now = Date.now();
    if (now - lastFetchRef.current < DEBOUNCE_MS) {
      return;
    }
    lastFetchRef.current = now;

    try {
      setLoading(true);
      setError(null);

      if (maChuyenLine) {
        // ✅ CRITICAL FIX: Extract factory and pass to API
        const targetFactory = extractFactoryFromCDCode(maChuyenLine);

        // ✅ CRITICAL FIX: Pass factory parameter to API call
        const response = await apiService.getTVDisplayData(
          maChuyenLine,
          targetFactory // ⭐ ADD THIS PARAMETER
        );

        if (response.success) {
          const allLines = Array.isArray(response.data)
            ? response.data
            : [response.data];

          // ✅ CRITICAL VALIDATION: Verify factory match
          if (allLines.length > 0) {
            const returnedFactories = [
              ...new Set(allLines.map((l: any) => l.nhaMay)),
            ];

            // ✅ CRITICAL ERROR: Log mismatch
            if (
              returnedFactories.length > 1 ||
              !returnedFactories.includes(targetFactory)
            ) {
              console.error(
                `❌ CD Hook: FACTORY MISMATCH! Expected ${targetFactory} but got: ${returnedFactories.join(
                  ", "
                )}`
              );
              console.error(
                `❌ CD Hook: Response factory field: "${response.factory}"`
              );
              console.error(
                `❌ CD Hook: Line codes:`,
                allLines.map((l: any) => l.maChuyenLine)
              );
            }
          }

          // Find the requested line from the response
          const requestedLine =
            allLines.find((l: any) => l.maChuyenLine === maChuyenLine) ||
            allLines[0];

          if (requestedLine) {
            updateDataStore(requestedLine);
          }

          setData({
            maChuyenLine: maChuyenLine,
            factory: response.factory || targetFactory,
            lineType: "CD",
            allLines: allLines,
            data: allLines,
            summary: requestedLine,
            count: response.count || allLines.length,
            lastUpdate: response.timestamp,
          });
        } else {
          // throw new Error("Failed to fetch CD data");
          console.error("❌ CD Hook: Failed to fetch data for", maChuyenLine);
        }
      } else {
        // Dashboard Mode - use provided factory or ALL
        const response = await apiService.getDataByLineType(
          "CD",
          factory || "ALL"
        );

        if (response.success) {
          setData(response);
        } else {
          // throw new Error("Failed to fetch CD data");
          console.error("❌ CD Hook: Failed to fetch dashboard data");
        }
      }
    } catch (err) {
      console.error("❌ CD Hook: Error fetching data:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch CD data");
    } finally {
      setLoading(false);
    }
  }, [maChuyenLine, factory, line, team, updateDataStore]);

  // Setup real-time WebSocket
  useEffect(() => {
    if (!enableRealtime || !maChuyenLine) return;

    const factory = extractFactoryFromCDCode(maChuyenLine);
    const allCDCodes = getAllCDCodesForFactory(maChuyenLine);
    

    if (websocketService.isConnected()) {
      setConnected(true);
    } else {
      console.warn("⚠️ CD Hook: WebSocket not connected yet, waiting...");
    }

    const handleUpdate = (incomingData: any) => {

      // ✅ CRITICAL: Accept updates from ANY CD line in same factory
      if (incomingData.maChuyenLine && !allCDCodes.includes(incomingData.maChuyenLine)) {
        console.warn(`⚠️ CD Hook: Ignoring update for ${incomingData.maChuyenLine}, not in our factory ${factory}`);
        return;
      }

      if (incomingData.lineType && incomingData.lineType !== "CD") {
        console.warn("⚠️ CD Hook: Ignoring non-CD update");
        return;
      }

      const newRecord = incomingData.data?.summary || incomingData.data?.data;

      if (newRecord) {
        
        updateDataStore(newRecord);

        setData((prev: any) => {
          if (!prev || !prev.data) {
            console.warn("⚠️ CD Hook: No previous data to update");
            return prev;
          }

          // ✅ Update the specific line in the array of 4 lines
          const updatedLines = prev.data.map((line: any) => {
            if (line.maChuyenLine === incomingData.maChuyenLine) {
              return { ...line, ...newRecord };
            }
            return line;
          });

          return {
            ...prev,
            data: updatedLines,
            allLines: updatedLines,
            summary: newRecord.maChuyenLine === maChuyenLine ? newRecord : prev.summary,
            lastUpdate: new Date().toISOString(),
          };
        });
      } else {
        console.warn("⚠️ CD Hook: No valid record in update data");
      }

      forceRefresh();
    };

    // ✅ Subscribe to ALL 4 CD lines of same factory
    allCDCodes.forEach((cdCode) => {
      websocketService.subscribeToMaChuyenLine(cdCode, handleUpdate);
      websocketService.subscribeToCDLine(cdCode, handleUpdate);
    });
    
    websocketService.onConnectionStatusChange((connected) => {
      setConnected(connected);
      
      if (connected) {
        allCDCodes.forEach((cdCode) => {
          websocketService.subscribeToMaChuyenLine(cdCode, handleUpdate);
          websocketService.subscribeToCDLine(cdCode, handleUpdate);
        });
      }
    });

    return () => {
      websocketService.unsubscribe(handleUpdate);
      
      // Remove CD-specific channel listeners for all codes
      const socket = (websocketService as any).socket;
      if (socket) {
        allCDCodes.forEach((cdCode) => {
          socket.off(`cd:${cdCode}`);
        });
      }
    };
  }, [maChuyenLine, enableRealtime, updateDataStore, forceRefresh]);

  // ⭐ OPTIMIZATION: Auto-refresh only as fallback when WebSocket disconnected
  useEffect(() => {
    if (!tvMode || !maChuyenLine) return;

    if (connected) {
      // WebSocket connected - disable auto-refresh to save quota
      autoRefreshService.stop();
    } else {
      // WebSocket disconnected - enable auto-refresh as fallback
      autoRefreshService.startAutoRefresh(30000, fetchData);
    }

    return () => {
      autoRefreshService.stop();
    };
  }, [tvMode, maChuyenLine, connected, fetchData]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    connected,
    refresh: fetchData,
  };
}
