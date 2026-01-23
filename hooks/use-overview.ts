"use client"
import { useState, useEffect, useCallback } from 'react'
import type { OverviewResponse } from '@/lib/types'

export function useOverview() {
  const [data, setData] = useState<OverviewResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const res = await fetch('/api/overview')
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error?.message || 'Failed to fetch')
      }
      
      const json = await res.json()
      setData(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}