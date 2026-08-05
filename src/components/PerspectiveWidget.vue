<template>
  <div
    ref="containerRef"
    id="mousecontainer"
    :style="containerStyle"
    @dblclick="reset"
  >
    <canvas ref="canvasRef" id="mousecanvas" :width="boxW" :height="boxH"></canvas>
    <div
      v-for="(pt, i) in points"
      :key="'mouse' + i"
      :id="'mouse' + i"
      class="p_point"
      :style="{ left: pt[0] * boxW - pointSize / 2 + 'px', top: pt[1] * boxH - pointSize / 2 + 'px' }"
    ></div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { debounce } from '../js/tools.js'

const props = defineProps({
  canvas: { type: Object },
  persp: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['update'])

const pointSize = 45
const containerRef = ref(null)
const canvasRef = ref(null)

const zeropoints = [[0.25, 0.25], [0.75, 0.25], [0.75, 0.75], [0.25, 0.75]]

let initpoints = props.persp?.after || props.persp?.before || zeropoints.slice(0)
let status = 0
if (props.persp?.before) status = 1

const points = ref(initpoints.slice(0))

let boxW = 0, boxH = 0
let ctx, containerTop, containerLeft
let dragging = false
let pointSelected
let firstdraw = true

const containerStyle = ref({})

function getCanvasEl() {
  if (props.canvas) {
    if (props.canvas.value) return props.canvas.value
    if (props.canvas instanceof HTMLElement) return props.canvas
  }
  return document.getElementById('canvas')
}

function computeStyle() {
  const el = getCanvasEl()
  if (!el) return
  const rect = el.getBoundingClientRect()
  boxW = el.offsetWidth
  boxH = el.offsetHeight
  containerTop = rect.top + window.scrollY
  containerLeft = rect.left + window.scrollX
  containerStyle.value = {
    position: 'fixed',
    top: containerTop + 'px',
    left: containerLeft + 'px',
    width: boxW + 'px',
    height: boxH + 'px',
  }
}

function draw() {
  points.value.forEach((e, i) => {
    const pt = document.getElementById('mouse' + i)
    if (pt) {
      pt.style.left = e[0] * boxW - pt.offsetWidth / 2 + 'px'
      pt.style.top = e[1] * boxH - pt.offsetHeight / 2 + 'px'
    }
  })

  if (!ctx) ctx = canvasRef.value.getContext('2d')
  ctx.clearRect(0, 0, boxW, boxH)
  ctx.lineWidth = 3
  ctx.strokeStyle = 'red'
  ctx.beginPath()
  for (let i = 0; i < 4; i++) {
    const x = points.value[i][0] * boxW
    const y = points.value[i][1] * boxH
    ctx.lineTo(x, y)
  }
  ctx.closePath()
  ctx.stroke()

  if (firstdraw) firstdraw = false
  else if (!props.persp.modified) props.persp.modified = true

  if (!status) {
    props.persp.before = points.value.slice(0)
  } else {
    props.persp.after = points.value.slice(0)
    emit('update', points.value.slice(0))
  }
}

function dragstart(e) {
  dragging = true
  const el = document.elementFromPoint(e.x, e.y)
  if (el && el.id && el.id.startsWith('mouse')) {
    pointSelected = parseInt(el.id.replace('mouse', ''))
  }
  containerRef.value.setPointerCapture(e.pointerId)
  containerRef.value.addEventListener('pointermove', dragmove)
  containerRef.value.addEventListener('pointerup', dragstop)
}

function dragmove(e) {
  if (dragging && pointSelected !== undefined) {
    const rect = containerRef.value.getBoundingClientRect()
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / boxW))
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / boxH))
    points.value[pointSelected] = [x, y]
    debounce('mouse', () => draw(), 20)
  }
}

function dragstop(e) {
  dragging = false
  pointSelected = undefined
  containerRef.value.releasePointerCapture(e.pointerId)
  containerRef.value.removeEventListener('pointermove', dragmove)
  containerRef.value.removeEventListener('pointerup', dragstop)
}

function reset() {
  props.persp.modified = false
  points.value = zeropoints.slice(0)
  draw()
}

onMounted(() => {
  computeStyle()
  window.addEventListener('resize', computeStyle)
  containerRef.value.addEventListener('pointerdown', dragstart)
  ctx = canvasRef.value.getContext('2d')
  draw()
})

onUnmounted(() => {
  window.removeEventListener('resize', computeStyle)
  if (containerRef.value) {
    containerRef.value.removeEventListener('pointerdown', dragstart)
  }
})
</script>

<style>
#mousecontainer {
  z-index: 1;
}
#mousecanvas {
  border: 1px solid white;
  background-image: repeating-linear-gradient(#ccc 0 1px, transparent 1px 100%),
    repeating-linear-gradient(90deg, #ccc 0 1px, transparent 1px 100%);
  background-size: 9.99% 9.99%;
  overflow: hidden;
  border: 0px solid white;
}
.p_point {
  position: absolute;
  width: 45px;
  height: 45px;
  background-color: white;
  border-radius: 50%;
  cursor: pointer;
  border: 15px solid transparent;
  background-clip: padding-box;
  box-sizing: border-box;
  z-index: 2;
}
</style>
