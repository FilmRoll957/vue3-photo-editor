<template>
  <div
    ref="histoRef"
    id="histo"
    style="position:absolute;left:10px;width:260px;height:100px;background-color:grey;padding:5px;cursor:pointer;"
  >
    <div style="position:absolute;color:grey;right:40px;font-size:80%;">{{ colorspace }}</div>
    <canvas ref="canvasRef" id="histogram" width="256" height="150" style="width:100%;height:100%;background-color:#121212;"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Worker from './histogram_worker.js?worker'
import { handlePointer } from '../js/zoom_pan.js'

const props = defineProps({
  colorspace: { type: String, default: 'srgb' },
})

const emit = defineEmits(['ready'])

const histoRef = ref(null)
const canvasRef = ref(null)

let thumb, thumbctx, histoctx
let worker, updating = false
let cleanevt

async function setupHistogramWorker() {
  try {
    thumb = new OffscreenCanvas(10, 10)
    thumb.width = 350
    thumbctx = thumb.getContext('2d', { colorSpace: props.colorspace, willReadFrequently: true })
    histoctx = canvasRef.value.getContext('2d')
    worker = new Worker()
    worker.onmessage = async (event) => {
      if (event.data.bitmap) {
        histoctx.clearRect(0, 0, histoctx.canvas.width, histoctx.canvas.height)
        histoctx.drawImage(event.data.bitmap, 0, 0)
        updating = false
      }
    }
    worker.onerror = (error) => {
      console.error(`Worker error: ${error.message}`)
      throw error
    }
    worker.postMessage({ init: true, width: histoctx.canvas.width, height: histoctx.canvas.height })
  } catch (e) { console.error(e) }
}

async function drawHistogram() {
  if (worker && !updating) {
    updating = true
    const canvas = document.getElementById('canvas')
    if (!canvas) { updating = false; return }
    thumb.height = thumb.width / (canvas.width / canvas.height)
    thumbctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, thumb.width, thumb.height)
    const pixels = thumbctx?.getImageData(0, 0, thumbctx.canvas.width, thumbctx.canvas.height).data
    worker.postMessage({ pixels })
  }
}

onMounted(() => {
  setupHistogramWorker()
  emit('ready', drawHistogram)
  if (histoRef.value) {
    cleanevt = handlePointer({
      el: histoRef.value,
      onMove: ({ ev, x, y, el }) => {
        ev.stopPropagation()
        const pos = el.style.transform.match(/translate\((.*?)\)/)?.[1].split(',').map(e => parseFloat(e)) || [0, 0]
        pos[0] += x
        pos[1] += y
        el.style.transform = `translate(${pos[0]}px,${pos[1]}px)`
      }
    })
  }
})

onUnmounted(() => {
  if (worker) worker.terminate()
  if (cleanevt) cleanevt()
})
</script>
