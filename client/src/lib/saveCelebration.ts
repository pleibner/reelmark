import confetti from 'canvas-confetti'

/** Quick burst when a video saves — monochrome-friendly sparkles + a silly second wave. */
export function fireSaveCelebration(): void {
  const mono = ['#111111', '#525252', '#a3a3a3', '#e5e5e5', '#ffffff']

  confetti({
    particleCount: 95,
    spread: 58,
    startVelocity: 32,
    gravity: 0.9,
    ticks: 220,
    origin: { x: 0.5, y: 0.15 },
    colors: mono,
    scalar: 0.9,
  })

  globalThis.setTimeout(() => {
    confetti({
      particleCount: 42,
      angle: 60,
      spread: 48,
      startVelocity: 38,
      origin: { x: 0, y: 0.3 },
      colors: mono,
      shapes: ['circle'],
    })
    confetti({
      particleCount: 42,
      angle: 120,
      spread: 48,
      startVelocity: 38,
      origin: { x: 1, y: 0.3 },
      colors: mono,
      shapes: ['circle'],
    })
  }, 180)

  globalThis.setTimeout(() => {
    confetti({
      particleCount: 28,
      spread: 360,
      startVelocity: 18,
      ticks: 100,
      origin: { x: 0.5, y: 0.45 },
      colors: mono,
      shapes: ['square'],
      scalar: 0.65,
    })
  }, 400)
}
