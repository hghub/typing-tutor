import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID

function ensureGtag() {
  if (!MEASUREMENT_ID || typeof window === 'undefined') return
  if (window.__rafiqyGaLoaded) return

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`
  document.head.appendChild(script)

  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() {
    window.dataLayer.push(arguments)
  }
  window.gtag('js', new Date())
  window.gtag('config', MEASUREMENT_ID, { send_page_view: false })
  window.__rafiqyGaLoaded = true
}

export default function GoogleAnalytics() {
  const location = useLocation()

  useEffect(() => {
    ensureGtag()
  }, [])

  useEffect(() => {
    if (!MEASUREMENT_ID || typeof window === 'undefined' || typeof window.gtag !== 'function') return

    const pagePath = `${location.pathname}${location.search}${location.hash}`
    window.gtag('config', MEASUREMENT_ID, {
      page_path: pagePath,
      page_location: window.location.href,
      page_title: document.title,
    })
  }, [location])

  return null
}
