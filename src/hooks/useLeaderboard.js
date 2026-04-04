import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../utils/supabase'

export function useLeaderboard(userId, show) {
  const [tab, setTab] = useState('global')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [userLocation, setUserLocation] = useState({ country: null, city: null })

  useEffect(() => {
    if (userId) {
      supabase.from('users').select('country, city').eq('id', userId).single()
        .then(({ data }) => { if (data) setUserLocation({ country: data.country, city: data.city }) })
    }
  }, [userId])

  const fetchLeaderboard = useCallback(async (activeTab, location) => {
    setLoading(true)
    try {
      // Fetch all users, then fetch their scores and compute stats client-side
      let userQuery = supabase
        .from('users')
        .select('id, display_name, country, city')

      if (activeTab === 'country' && location?.country && location.country !== 'Unknown') {
        userQuery = userQuery.eq('country', location.country).neq('country', 'Unknown')
      } else if (activeTab === 'city' && location?.city && location.city !== 'Unknown') {
        userQuery = userQuery.eq('city', location.city).neq('city', 'Unknown')
      } else if (activeTab !== 'global') {
        // user has no location — show empty
        setRows([]); setLoading(false); return
      }

      const { data: users, error: usersError } = await userQuery
      if (usersError) throw usersError
      if (!users || users.length === 0) { setRows([]); return }

      const userIds = users.map((u) => u.id)
      const { data: scores, error: scoresError } = await supabase
        .from('scores')
        .select('user_id, wpm, accuracy')
        .in('user_id', userIds)

      if (scoresError) throw scoresError

      // Aggregate scores per user
      const statsMap = {}
      for (const s of (scores || [])) {
        if (!statsMap[s.user_id]) statsMap[s.user_id] = { wpms: [], accuracies: [] }
        statsMap[s.user_id].wpms.push(s.wpm)
        statsMap[s.user_id].accuracies.push(s.accuracy)
      }

      const ranked = users
        .map((u) => {
          const st = statsMap[u.id]
          if (!st) return null
          const avgWpm = Math.round(st.wpms.reduce((a, b) => a + b, 0) / st.wpms.length)
          const bestWpm = Math.max(...st.wpms)
          const avgAccuracy = Math.round(st.accuracies.reduce((a, b) => a + b, 0) / st.accuracies.length)
          return { ...u, avg_wpm: avgWpm, best_wpm: bestWpm, avg_accuracy: avgAccuracy, total_sessions: st.wpms.length }
        })
        .filter(Boolean)
        .sort((a, b) => b.avg_wpm - a.avg_wpm)
        .slice(0, 20)

      setRows(ranked)
    } catch (err) {
      console.error('Leaderboard fetch failed:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (show) fetchLeaderboard(tab, userLocation)
  }, [show, tab, userLocation, fetchLeaderboard])

  function changeTab(newTab) {
    setTab(newTab)
  }

  return { tab, changeTab, rows, loading, userLocation }
}
