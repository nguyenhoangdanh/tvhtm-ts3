'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import apiService from '@/services/api.service';
import websocketService from '@/services/websocket.service';
import autoRefreshService from '@/services/auto-refresh.service';
import { CenterTVResponse, CenterTVGroup } from '@/types/api.types';

interface UseCenterTVOptions {
  factory: string;
  line: string;
  enableRealtime?: boolean;
  tvMode?: boolean;
}

export function useCenterTVData({
  factory,
  line,
  enableRealtime = true,
  tvMode = false,
}: UseCenterTVOptions) {
  const [data, setData] = useState<CenterTVResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  
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

      const response = await apiService.getCenterTVData(factory, line);
      
      
      if (response.success && response.data && response.data.groups) {
        const tglv = response.data.groups[0]?.tglv || 0;
        setData({...response, tglv });
      } else {
        // Log detailed error info
        console.warn('⚠️ Center TV: Invalid response structure:', {
          success: response.success,
          hasData: !!response.data,
          hasGroups: response.data?.groups ? true : false,
          groupsLength: response.data?.groups?.length || 0,
          fullResponse: response
        });
        
        // If no groups, set empty data instead of throwing error
        if (response.success && response.data && !response.data.groups) {
          setData({
            ...response,
            data: {
              groups: [],
              summary: {
                totalGroups: 0,
                totalLayout: 0,
                totalKeHoachNgay: 0,
                totalLkTh: 0,
                totalLkKh: 0,
                averagePhanTramHt: 0,
                tglv: 0,
              }
            }
          });
        } else {
          throw new Error((response as any).error || `No data found for ${factory} LINE ${line}`);
        }
      }
    } catch (err) {
      console.error('❌ Error fetching Center TV data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch Center TV data');
    } finally {
      setLoading(false);
    }
  }, [factory, line]);

  // Setup real-time WebSocket for Center TV
  useEffect(() => {
    if (!enableRealtime) return;

    console.log(`🔌 useCenterTVData: Setting up real-time for ${factory} LINE ${line}`);

    const handleUpdate = (updateData: any) => {
      console.log(`📦 useCenterTVData: Received update for ${updateData.factory} LINE ${updateData.line}`);
      
      if (updateData.factory !== factory || updateData.line !== line) {
        console.warn('⚠️ useCenterTVData: Factory/Line mismatch, ignoring update');
        return;
      }

      setData({
        success: true,
        factory: updateData.factory,
        line: updateData.line,
        data: updateData.data,
        timestamp: updateData.timestamp,
      });
      
      console.log('✅ useCenterTVData: Data updated from WebSocket');
    };

    // ✅ CRITICAL FIX: Subscribe to Center TV room
    websocketService.subscribeToCenterTV(factory, line, handleUpdate);

    // Subscribe to system updates for Center TV refresh broadcasts
    websocketService.onSystemUpdate((systemData: any) => {
      if (systemData.type === 'center-tv-refresh') {
        console.log('🔄 useCenterTVData: System refresh triggered');
        fetchData();
      }
    });
    
    websocketService.onConnectionStatusChange(setConnected);

    // No cleanup needed - socket service handles it
    return () => {
      console.log(`🔌 useCenterTVData: Cleanup for ${factory} LINE ${line}`);
    };
  }, [factory, line, enableRealtime, fetchData]);

  // ⭐ OPTIMIZATION: Auto-refresh only as fallback when WebSocket disconnected
  useEffect(() => {
    if (!tvMode) return;

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
  }, [tvMode, connected, fetchData]);

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
    groups: data?.data?.groups || [],
    summary: data?.data?.summary || null,
  };
}