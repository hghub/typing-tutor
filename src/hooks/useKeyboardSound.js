import { useRef, useState } from 'react'

export function useKeyboardSound() {
  const [soundOn, setSoundOn] = useState(() => localStorage.getItem('typingSound') !== 'off')
  const ctx = useRef(null)

  function getCtx() {
    if (!ctx.current) ctx.current = new (window.AudioContext || window.webkitAudioContext)()
    return ctx.current
  }

  function playClick(isError = false) {
    if (!soundOn) return
    try {
      const ac = getCtx()
      const gain = ac.createGain()
      gain.connect(ac.destination)

      if (isError) {
        // Error: two-tone "buzz" — descending square wave
        const osc1 = ac.createOscillator()
        const osc2 = ac.createOscillator()
        osc1.connect(gain); osc2.connect(gain)
        osc1.type = 'square'; osc2.type = 'square'
        osc1.frequency.value = 220
        osc2.frequency.value = 180
        gain.gain.setValueAtTime(0.06, ac.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.18)
        osc1.start(ac.currentTime); osc1.stop(ac.currentTime + 0.18)
        osc2.start(ac.currentTime + 0.04); osc2.stop(ac.currentTime + 0.18)
      } else {
        // Correct: crisp high click
        const osc = ac.createOscillator()
        osc.connect(gain)
        osc.type = 'sine'
        osc.frequency.setValueAtTime(800, ac.currentTime)
        osc.frequency.exponentialRampToValueAtTime(400, ac.currentTime + 0.05)
        gain.gain.setValueAtTime(0.07, ac.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.05)
        osc.start(ac.currentTime); osc.stop(ac.currentTime + 0.05)
      }
    } catch { /* ignore */ }
  }

  function toggleSound() {
    setSoundOn((prev) => {
      const next = !prev
      localStorage.setItem('typingSound', next ? 'on' : 'off')
      return next
    })
  }

  return { soundOn, toggleSound, playClick }
}
