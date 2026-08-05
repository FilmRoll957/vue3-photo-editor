export function zoom_pan(zoomable, pannable) {
  if (!zoomable || !pannable) return () => {}

  let currentTransform = { x: 0, y: 0, scale: 1 }
  let dragging = false
  let lastX = 0, lastY = 0
  let dist0 = 0

  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val))
  }

  function onWheel(e) {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    const newScale = clamp(currentTransform.scale * delta, 0.5, 5)
    currentTransform.scale = newScale
    applyTransform()
  }

  function onPointerDown(e) {
    dragging = true
    lastX = e.clientX
    lastY = e.clientY
    pannable.setPointerCapture(e.pointerId)
  }

  function onPointerMove(e) {
    if (!dragging) return
    const dx = e.clientX - lastX
    const dy = e.clientY - lastY
    lastX = e.clientX
    lastY = e.clientY
    currentTransform.x += dx
    currentTransform.y += dy
    applyTransform()
  }

  function onPointerUp(e) {
    dragging = false
    pannable.releasePointerCapture(e.pointerId)
  }

  function onTouchStart(e) {
    if (e.touches.length === 2) {
      dist0 = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      )
    }
  }

  function onTouchMove(e) {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      )
      const newScale = clamp(currentTransform.scale * (dist / dist0), 0.5, 5)
      dist0 = dist
      currentTransform.scale = newScale
      applyTransform()
    }
  }

  function applyTransform() {
    zoomable.style.transform = `scale(${currentTransform.scale})`
    pannable.style.transform = `translate(${currentTransform.x}px, ${currentTransform.y}px)`
  }

  function handlePointer(e) {
    e.preventDefault()
  }

  zoomable.addEventListener('wheel', onWheel, { passive: false })
  pannable.addEventListener('pointerdown', onPointerDown)
  pannable.addEventListener('pointermove', onPointerMove)
  pannable.addEventListener('pointerup', onPointerUp)
  pannable.addEventListener('pointercancel', onPointerUp)
  pannable.addEventListener('pointerleave', onPointerUp)
  zoomable.addEventListener('touchstart', onTouchStart, { passive: true })
  zoomable.addEventListener('touchmove', onTouchMove, { passive: true })
  zoomable.addEventListener('pointermove', handlePointer)

  return () => {
    zoomable.removeEventListener('wheel', onWheel)
    pannable.removeEventListener('pointerdown', onPointerDown)
    pannable.removeEventListener('pointermove', onPointerMove)
    pannable.removeEventListener('pointerup', onPointerUp)
    pannable.removeEventListener('pointercancel', onPointerUp)
    pannable.removeEventListener('pointerleave', onPointerUp)
    zoomable.removeEventListener('touchstart', onTouchStart)
    zoomable.removeEventListener('touchmove', onTouchMove)
    zoomable.removeEventListener('pointermove', handlePointer)
    zoomable.style.transform = ''
    pannable.style.transform = ''
  }
}

export function handlePointer({ el, onMove }) {
  let lastX = 0, lastY = 0, dragging = false

  function onPointerDown(e) {
    dragging = true
    lastX = e.clientX
    lastY = e.clientY
    el.setPointerCapture(e.pointerId)
  }

  function onPointerMove(e) {
    if (!dragging) return
    const x = e.clientX - lastX
    const y = e.clientY - lastY
    lastX = e.clientX
    lastY = e.clientY
    if (onMove) onMove({ ev: e, x, y, el })
  }

  function onPointerUp(e) {
    dragging = false
    el.releasePointerCapture(e.pointerId)
  }

  el.addEventListener('pointerdown', onPointerDown)
  el.addEventListener('pointermove', onPointerMove)
  el.addEventListener('pointerup', onPointerUp)

  return () => {
    el.removeEventListener('pointerdown', onPointerDown)
    el.removeEventListener('pointermove', onPointerMove)
    el.removeEventListener('pointerup', onPointerUp)
  }
}
