export default function AnimatedBackground() {
  const blobBase = {
    position: 'absolute',
    width: '384px',
    height: '384px',
    borderRadius: '9999px',
    mixBlendMode: 'multiply',
    filter: 'blur(64px)',
    opacity: 0.2,
    animation: 'blob 7s infinite',
  }

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <div style={{ ...blobBase, top: 0, right: 0, backgroundColor: '#a855f7' }} />
      <div style={{ ...blobBase, bottom: 0, left: '50%', backgroundColor: '#3b82f6', animationDelay: '2s' }} />
    </div>
  )
}
