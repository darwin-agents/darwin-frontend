/**
 * Drives a WebGL render loop only while `el` is on screen.
 * Under prefers-reduced-motion it only draws the initial static frame.
 * Call from onMounted; returns a stop function for onUnmounted.
 */
export function useRenderLoop(el: Element, frame: (now: number) => void) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  let raf = 0
  const loop = (now: number) => {
    frame(now)
    raf = requestAnimationFrame(loop)
  }
  // Draw once right away (an untouched WebGL canvas can get its context dropped).
  frame(performance.now())
  const io = new IntersectionObserver(([entry]) => {
    cancelAnimationFrame(raf)
    if (entry?.isIntersecting && !reduced) raf = requestAnimationFrame(loop)
  })
  io.observe(el)
  return () => {
    cancelAnimationFrame(raf)
    io.disconnect()
  }
}
