<template>
  <div ref="containerRef" id="splitview_container">
    <img ref="imgRef" id="splitview" />
    <div ref="barRef" id="splitview_bar"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'

const props = defineProps({
  image: { type: Object },
})

const emit = defineEmits(['update'])

const containerRef = ref(null)
const imgRef = ref(null)
const barRef = ref(null)

let splitwidth = 0.5
let dragging = false, _x

function resetSplitRect(sw) {
  if (!imgRef.value || !props.image) return
  if (sw !== undefined) splitwidth = sw

  const canvas = document.getElementById('canvas')
  if (canvas && containerRef.value) {
    const rect = canvas.getBoundingClientRect()
    const pannable = document.getElementById('pannable')
    const pRect = pannable.getBoundingClientRect()
    containerRef.value.style.width = rect.width + 'px'
    containerRef.value.style.height = rect.height + 'px'
    containerRef.value.style.left = (rect.left - pRect.left) + 'px'
    containerRef.value.style.top = (rect.top - pRect.top) + 'px'
  }

  imgRef.value.src = props.image.src
  imgRef.value.style.clipPath = `inset(0px ${(1 - splitwidth) * 100}% 0px 0px)`
  if (barRef.value) {
    barRef.value.style.left = `calc(${splitwidth * 100}% - 5px)`
  }
}

function dragstart(e) {
  dragging = true
  containerRef.value.setPointerCapture(e.pointerId)
  containerRef.value.addEventListener('pointermove', drag)
  containerRef.value.addEventListener('pointerup', dragstop)
  _x = e.clientX
}

function dragstop() {
  dragging = false
  containerRef.value.releasePointerCapture()
  containerRef.value.removeEventListener('pointermove', drag)
  containerRef.value.removeEventListener('pointerup', dragstop)
  emit('update', splitwidth)
}

function drag(e) {
  if (!dragging) return
  e.preventDefault()
  e.stopPropagation()
  const splitscale = 1 / containerRef.value.clientWidth
  const zoomable = document.getElementById('zoomable')
  const parentscale = zoomable?.style.transform.match(/scale\((.*?)\)/)?.[1].split(',').map(e => parseFloat(e))[0] || 1
  splitwidth += (e.clientX - _x) * splitscale / parentscale
  _x = e.clientX
  splitwidth = Math.max(0.1, Math.min(0.9, splitwidth))
  if (imgRef.value) {
    imgRef.value.style.clipPath = `inset(0px ${(1 - splitwidth) * 100}% 0px 0px)`
  }
  if (barRef.value) {
    barRef.value.style.left = `calc(${splitwidth * 100}% - 5px)`
  }
}

watch(() => props.image, (val) => {
  if (val) nextTick(() => resetSplitRect())
})

onMounted(() => {
  nextTick(() => {
    resetSplitRect()
    if (containerRef.value) {
      containerRef.value.addEventListener('pointerdown', dragstart)
    }
  })
})

onUnmounted(() => {
  if (containerRef.value) {
    containerRef.value.removeEventListener('pointerdown', dragstart)
  }
})
</script>

<style>
#splitview_container {
  position: absolute;
  display: flex;
}
#splitview_container img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
}
#splitview_bar {
  position: absolute;
  width: 5px;
  height: 100%;
  background-color: #607d8b8c;
  pointer-events: none;
}
</style>
