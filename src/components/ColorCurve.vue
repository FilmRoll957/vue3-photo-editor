<template>
  <div class="curve_wrapper">
    <div id="cccolors" style="display:flex;flex-direction:row;max-width:275px;">
      <div style="width:60px;">
        <button id="space0" class="clrspace selected" style="border-color:white;" title="all colors" @click="setColorSpace(0)"></button>
        <button id="space1" class="clrspace" style="border-color:#c13119;" title="red" @click="setColorSpace(1)"></button>
        <button id="space2" class="clrspace" style="border-color:#0c9427;" title="green" @click="setColorSpace(2)"></button>
        <button id="space3" class="clrspace" style="border-color:#1e73be;" title="blue" @click="setColorSpace(3)"></button>
      </div>
      <div
        ref="curvecontainerRef"
        id="curvecontainer"
        @dblclick="dblclick"
      >
        <canvas ref="canvasRef" id="curvescanvas" :width="size" :height="size"></canvas>
        <div
          v-for="(pt, i) in colorPoints"
          :key="'pt' + i"
          :id="'pt' + i"
          class="point"
          :style="{ left: pt[0] * canvasW - pointSize / 2 + 'px', bottom: pt[1] * canvasH - pointSize / 2 + 'px' }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { Spline } from '@xdadda/mini-gl'
import { debounce } from '../js/tools.js'

const props = defineProps({
  curve: { type: Object, required: true },
})

const emit = defineEmits(['update'])

const size = 256
const pointSize = 45
const curvecontainerRef = ref(null)
const canvasRef = ref(null)

let colorspace = props.curve?.space || 0
let points = props.curve?.curvepoints ? [...props.curve.curvepoints] : new Array(4).fill(null)
let modified = new Array(4)
points.forEach((e, i) => {
  if (!e) modified[i] = null
  else modified[i] = true
})

const colorPoints = ref([])
let canvasW = 0
let canvasH = 0

let ctx = null
let dragging = false
let pointSelected

function resetOne(space) {
  const np = props.curve?.numpoints || 5
  points[space] = []
  for (let i = 0; i < np; i++) {
    const x = i / (np - 1)
    points[space].push([x, x])
  }
  modified[space] = null
}

if (points[colorspace] && points[colorspace].length > 0) {
  colorPoints.value = [...points[colorspace]]
} else {
  resetOne(colorspace)
  colorPoints.value = [...points[colorspace]]
}

function setColorSpace(space) {
  const cccolors = document.getElementById('cccolors')
  if (cccolors) {
    const sel = cccolors.querySelector('.clrspace.selected')
    if (sel) sel.classList.remove('selected')
  }
  const btn = document.getElementById('space' + space)
  if (btn) btn.classList.add('selected')

  colorspace = space
  props.curve.space = colorspace
  if (points[space]) {
    colorPoints.value = [...points[space]]
    nextTick(() => draw())
  } else {
    resetOne(space)
    colorPoints.value = [...points[space]]
    nextTick(() => draw())
  }
}

function dblclick() {
  resetOne(colorspace)
  colorPoints.value = [...points[colorspace]]
  draw()
}

function dragstart(e) {
  if (!curvecontainerRef.value) return
  dragging = true
  curvecontainerRef.value.setPointerCapture(e.pointerId)
  curvecontainerRef.value.addEventListener('pointermove', drag)
  curvecontainerRef.value.addEventListener('pointerup', dragstop)

  canvasW = canvasRef.value.offsetWidth
  canvasH = canvasRef.value.offsetHeight

  const el = document.elementFromPoint(e.x, e.y)
  if (el && el.id && el.id.startsWith('pt')) {
    pointSelected = parseInt(el.id.replace('pt', ''))
  }
  modified[colorspace] = true
  mousePos(e)
}

function dragstop(e) {
  dragging = false
  if (!curvecontainerRef.value) return
  curvecontainerRef.value.releasePointerCapture(e.pointerId)
  curvecontainerRef.value.removeEventListener('pointermove', drag)
  curvecontainerRef.value.removeEventListener('pointerup', dragstop)
  pointSelected = undefined
}

const clamp = (min, val, max) => Math.max(min, Math.min(max, val))

function mousePos(e) {
  if (pointSelected === undefined) return
  canvasW = canvasRef.value.offsetWidth
  canvasH = canvasRef.value.offsetHeight
  const np = props.curve?.numpoints || 5
  const minx = pointSelected > 0 ? points[colorspace][pointSelected - 1][0] + 0.1 : 0
  const maxx = pointSelected < np - 1 ? points[colorspace][pointSelected + 1][0] - 0.1 : 1
  const rect = curvecontainerRef.value.getBoundingClientRect()
  const x = clamp(minx, (e.clientX - rect.left) / canvasW, maxx)
  const y = clamp(0, 1 - (e.clientY - rect.top) / canvasH, 1)
  points[colorspace][pointSelected] = [x, y]
}

function drag(e) {
  if (dragging && pointSelected !== undefined) {
    mousePos(e)
    colorPoints.value = [...points[colorspace]]
    debounce('curve', () => draw(), 20)
  }
}

function draw() {
  const np = props.curve?.numpoints || 5
  if (!points?.[colorspace] || points[colorspace].length < np) return

  points[colorspace].forEach((e, i) => {
    const pt = document.getElementById('pt' + i)
    if (pt) {
      canvasW = canvasRef.value.offsetWidth
      canvasH = canvasRef.value.offsetHeight
      pt.style.left = e[0] * canvasW - pointSize / 2 + 'px'
      pt.style.bottom = e[1] * canvasH - pointSize / 2 + 'px'
    }
  })

  if (!ctx) {
    ctx = canvasRef.value.getContext('2d')
  }

  const xs = points[colorspace].map(e => e[0])
  const ys = points[colorspace].map(e => e[1])
  const spline = new Spline(points[colorspace])

  ctx.clearRect(0, 0, size, size)
  ctx.lineWidth = 4
  ctx.strokeStyle = '#4B4947'
  ctx.beginPath()
  for (let i = 0; i < size; i++) {
    let y
    if (i < xs[0] * size) y = ys[0]
    else if (i > xs[xs.length - 1] * size) y = ys[ys.length - 1]
    else y = clamp(0, spline.at(i / (size - 1)), 1)
    ctx.lineTo(i, (1 - y) * size)
  }
  ctx.stroke()
  ctx.fillStyle = 'white'

  if (typeof emit === 'function') emit('update', points, modified)
}

let observer

onMounted(() => {
  nextTick(() => {
    canvasW = canvasRef.value.offsetWidth
    canvasH = canvasRef.value.offsetHeight
    ctx = canvasRef.value.getContext('2d')
    curvecontainerRef.value.addEventListener('pointerdown', dragstart)
    draw()
  })

  props.curve.resetFn = () => {
    colorspace = 0
    props.curve.space = 0
    props.curve.curvepoints = null
    points = new Array(4).fill(null)
    modified = new Array(4)
    setColorSpace(0)
  }

  observer = new ResizeObserver(() => {
    nextTick(() => {
      colorPoints.value = [...points[colorspace]]
      draw()
    })
  })
  if (curvecontainerRef.value) observer.observe(curvecontainerRef.value)
})

onUnmounted(() => {
  if (curvecontainerRef.value) {
    curvecontainerRef.value.removeEventListener('pointerdown', dragstart)
  }
  if (observer) observer.disconnect()
})
</script>

<style>
.clrspace {
  border-radius: 50%;
  width: 24px;
  height: 24px;
  border: 2px solid;
  background: transparent;
  cursor: pointer;
  display: block;
  margin: 2px auto;
  opacity: 0.5;
}
.clrspace.selected {
  opacity: 1;
  border-width: 3px;
}

#curvecontainer {
  position: relative;
  width: 200px;
  height: 120px;
  margin: auto;
  background-image: radial-gradient(#5b5b5b 1px, transparent 0);
  background-size: 10% 10%;
  border-radius: 10px;
  border: 1px solid #5b5b5b;
}

#curvescanvas {
  width: inherit;
  height: inherit;
  overflow: hidden;
  border: 0px solid white;
}

.point {
  position: absolute;
  background-color: white;
  width: 45px;
  height: 45px;
  border-radius: 50%;
  cursor: pointer;
  border: 17px solid transparent;
  background-clip: padding-box;
  box-sizing: border-box;
}
</style>
