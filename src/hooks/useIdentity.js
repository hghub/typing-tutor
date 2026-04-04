import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'

const USER_KEY = 'typingTutorUserId'

function generateCode(name) {
  const suffix = Math.floor(1000 + Math.random() * 9000)
  return `${name.trim()}#${suffix}`
}

async function getLocationInfo() {
  try {
    const res = await fetch('https://freeipapi.com/api/json/')
    if (!res.ok) throw new Error('failed')
    const data = await res.json()
    return { country: data.countryName || null, city: data.cityName || 'Unknown' }
  } catch {
    return { country: null, city: 'Unknown' }
  }
}

export function useIdentity() {
  const [userId, setUserId] = useState(() => localStorage.getItem(USER_KEY) || null)
  const [displayName, setDisplayName] = useState(null)
  const [showIdentityModal, setShowIdentityModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [detectedCountry, setDetectedCountry] = useState(null)
  const [detectedCity, setDetectedCity] = useState(null)

  useEffect(() => {
    if (!userId) {
      setShowIdentityModal(true)
      getLocationInfo().then(({ country, city }) => {
        setDetectedCountry(country)
        setDetectedCity(city !== 'Unknown' ? city : null)
      })
    } else {
      fetchDisplayName(userId)
    }
  }, [userId])

  async function fetchDisplayName(id) {
    const { data } = await supabase.from('users').select('display_name').eq('id', id).single()
    if (data) setDisplayName(data.display_name)
  }

  async function createUser(name, country, city) {
    setLoading(true)
    setError(null)
    try {
      const code = generateCode(name)
      const { error: err } = await supabase.from('users').insert({
        id: code,
        display_name: name.trim(),
        country: country || 'Unknown',
        city: city || 'Unknown',
      })
      if (err) throw err
      localStorage.setItem(USER_KEY, code)
      setUserId(code)
      setDisplayName(name.trim())
      setShowIdentityModal(false)
    } catch (err) {
      setError('Failed to create profile. Try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function resumeUser(code) {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase.from('users').select('display_name').eq('id', code.trim()).single()
      if (err || !data) throw new Error('Code not found')
      localStorage.setItem(USER_KEY, code.trim())
      setUserId(code.trim())
      setDisplayName(data.display_name)
      setShowIdentityModal(false)
    } catch {
      setError('Code not found. Check your code and try again.')
    } finally {
      setLoading(false)
    }
  }

  return { userId, displayName, showIdentityModal, setShowIdentityModal, loading, error, detectedCountry, detectedCity, createUser, resumeUser }
}
