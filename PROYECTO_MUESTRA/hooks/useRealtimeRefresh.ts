"use client"

import { useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"

type RealtimeTable = "loads" | "containers" | "vessels" | "activity_log"

type UseRealtimeRefreshOptions = {
  tables: RealtimeTable[]
  onRefresh: () => void
  debounceMs?: number
}

/**
 * Subscribes to realtime table updates and triggers a debounced refresh callback.
 * Includes graceful reconnection if the channel enters an unhealthy state.
 */
export function useRealtimeRefresh({
  tables,
  onRefresh,
  debounceMs = 1200,
}: UseRealtimeRefreshOptions) {
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!tables.length) return

    const supabase = createClient()
    let channel = supabase.channel(`live-refresh:${tables.join(",")}:${Date.now()}`)
    let unsubscribed = false

    const triggerRefresh = () => {
      if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current)
      refreshTimeoutRef.current = setTimeout(() => {
        onRefresh()
      }, debounceMs)
    }

    const wireChannel = () => {
      for (const table of tables) {
        channel = channel.on(
          "postgres_changes",
          { event: "*", schema: "public", table },
          triggerRefresh
        )
      }

      channel.subscribe((status) => {
        if (unsubscribed) return
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
          if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current)
          reconnectTimeoutRef.current = setTimeout(() => {
            if (unsubscribed) return
            supabase.removeChannel(channel)
            channel = supabase.channel(`live-refresh:${tables.join(",")}:${Date.now()}`)
            wireChannel()
          }, 2000)
        }
      })
    }

    wireChannel()

    return () => {
      unsubscribed = true
      if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current)
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current)
      supabase.removeChannel(channel)
    }
  }, [tables, onRefresh, debounceMs])
}
