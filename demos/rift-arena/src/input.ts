import type { Vec2 } from './types'

export interface InputState {
  keys: Set<string>
  mouseX: number
  mouseY: number
  mouseWorld: Vec2
  lmb: boolean
  lmbPressed: boolean
  qPressed: boolean
  ePressed: boolean
  rPressed: boolean
}

export function createInput(canvas: HTMLCanvasElement): InputState {
  const st: InputState = {
    keys: new Set(),
    mouseX: 0,
    mouseY: 0,
    mouseWorld: { x: 0, y: 0 },
    lmb: false,
    lmbPressed: false,
    qPressed: false,
    ePressed: false,
    rPressed: false,
  }

  window.addEventListener('keydown', (e) => {
    st.keys.add(e.code)
    if (e.code === 'KeyQ') st.qPressed = true
    if (e.code === 'KeyE') st.ePressed = true
    if (e.code === 'KeyR') st.rPressed = true
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
      e.preventDefault()
    }
  })
  window.addEventListener('keyup', (e) => st.keys.delete(e.code))

  canvas.addEventListener('mousemove', (e) => {
    const r = canvas.getBoundingClientRect()
    st.mouseX = ((e.clientX - r.left) / r.width) * canvas.width
    st.mouseY = ((e.clientY - r.top) / r.height) * canvas.height
  })
  canvas.addEventListener('mousedown', (e) => {
    if (e.button === 0) {
      st.lmb = true
      st.lmbPressed = true
    }
  })
  window.addEventListener('mouseup', (e) => {
    if (e.button === 0) st.lmb = false
  })

  return st
}

export function consumeFrameInput(st: InputState): void {
  st.lmbPressed = false
  st.qPressed = false
  st.ePressed = false
  st.rPressed = false
}

export function moveVector(st: InputState): Vec2 {
  let x = 0
  let y = 0
  if (st.keys.has('KeyW') || st.keys.has('ArrowUp')) y -= 1
  if (st.keys.has('KeyS') || st.keys.has('ArrowDown')) y += 1
  if (st.keys.has('KeyA') || st.keys.has('ArrowLeft')) x -= 1
  if (st.keys.has('KeyD') || st.keys.has('ArrowRight')) x += 1
  if (!x && !y) return { x: 0, y: 0 }
  const l = Math.hypot(x, y) || 1
  return { x: x / l, y: y / l }
}
