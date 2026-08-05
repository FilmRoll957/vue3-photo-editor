<template>
  <div
    ref="cropRef"
    id="crop"
    :style="{ width: cropWidth + 'px', height: cropHeight + 'px' }"
    @dblclick="resetCropRect"
    @click="clickCropRect"
  >
    <div ref="croprectRef" id="croprect" :style="croprectStyle">
      <div class="cropcorner" id="top_left"></div>
      <div class="cropcorner" id="top_right"></div>
      <div class="cropcorner" id="bottom_left"></div>
      <div class="cropcorner" id="bottom_right"></div>
      <template v-if="showTopBottom">
        <div class="cropcorner" id="left"></div>
        <div class="cropcorner" id="right"></div>
        <div class="cropcorner" id="top"></div>
        <div class="cropcorner" id="bottom"></div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'

const props = defineProps({
  canvas: { type: Object },
  params: { type: Object, required: true },
  onCropUpdate: { type: Function, default: null },
})

const cropRef = ref(null)
const croprectRef = ref(null)
const showTopBottom = ref(true)
const cropWidth = ref(0)
const cropHeight = ref(0)
const croprectStyle = ref({})

let dragging = false
let cropMousePos
let _left, _right, _top, _bottom
let box, rect
let lastClick = 0
const hotspot = 50
const minSize = 100

function resetCropRect(paramsc) {
  const canvas = getCanvas()
  if (!canvas) return
  cropWidth.value = Math.round(canvas.offsetWidth)
  cropHeight.value = Math.round(canvas.offsetHeight)

  const params = props.params.crop
  if (params.ar) {
    croprectRef.value.style.aspectRatio = params.ar
  } else {
    croprectRef.value.style.aspectRatio = ''
  }

  let c
  if (paramsc) {
    c = paramsc
  } else if (params.currentcrop) {
    c = params.currentcrop
  }

  if (!c) {
    croprectStyle.value = { inset: '0' }
    params.currentcrop = 0
  } else {
    croprectStyle.value = {
      inset: `${c.offsetTop}px ${c.offsetRight}px ${c.offsetBottom}px ${c.offsetLeft}px`
    }
  }
  if (props.onCropUpdate) props.onCropUpdate(params.currentcrop || 0)
}

function clickCropRect(e) {
  e.preventDefault()
  if (lastClick && Date.now() - lastClick < 200) return resetCropRect()
  lastClick = Date.now()
}

function getCanvas() {
  if (props.canvas) {
    if (props.canvas.value) return props.canvas.value
    return props.canvas
  }
  return document.getElementById('canvas')
}

function updateRect() {
  const cr = croprectRef.value
  const rect = cr.getBoundingClientRect()
  const box = cropRef.value.getBoundingClientRect()
  const result = {
    ...JSON.parse(JSON.stringify(rect)),
    offsetTop: cr.offsetTop,
    offsetLeft: cr.offsetLeft,
    offsetHeight: cr.offsetHeight,
    offsetWidth: cr.offsetWidth,
    offsetBottom: box.height - cr.offsetTop - cr.offsetHeight,
    offsetRight: box.width - cr.offsetLeft - cr.offsetWidth
  }
  return { rect: result, box }
}

function dragStart(e) {
  dragging = true
  const crop = cropRef.value
  const cr = croprectRef.value
  const params = props.params.crop

  crop.setPointerCapture(e.pointerId)
  crop.addEventListener('pointermove', drag)
  crop.addEventListener('pointerup', dragStop)

  if (params.ar) {
    cr.style.aspectRatio = params.ar
    showTopBottom.value = false
  } else {
    cr.style.aspectRatio = ''
    showTopBottom.value = true
  }

  cropMousePos = { x: e.x, y: e.y }
  const r = updateRect()
  box = r.box
  rect = r.rect

  const checkHotspot = (v) => v >= 0 && v <= hotspot
  _left = checkHotspot(cropMousePos.x - rect.left + 10)
  _right = checkHotspot(rect.right - cropMousePos.x + 10)
  _top = checkHotspot(cropMousePos.y - rect.top + 10)
  _bottom = checkHotspot(rect.bottom - cropMousePos.y + 10)

  cr.style.top = cr.offsetTop + 'px'
  cr.style.bottom = box.height - cr.offsetTop - cr.offsetHeight + 'px'
  cr.style.left = cr.offsetLeft + 'px'
  cr.style.right = box.width - cr.offsetLeft - cr.offsetWidth + 'px'
}

function drag(e) {
  if (!dragging) return
  const cr = croprectRef.value
  const dx = e.x - cropMousePos.x
  const dy = e.y - cropMousePos.y

  const ar = cr.style.aspectRatio
  const ratio = ar ? ar.split('/')[0] / ar.split('/')[1] : 0
  const clamp = (lo, value, hi) => Math.max(lo, Math.min(value, hi))

  if (_top) {
    if (!ar) cr.style.top = clamp(0, rect.offsetTop + dy, rect.offsetTop + rect.offsetHeight - minSize) + 'px'
    else {
      if (_right || _left) {
        cr.style.top = 'auto'
        cr.style.bottom = box.height - cr.offsetTop - cr.offsetHeight + 'px'
      }
    }
  }
  if (_bottom) {
    if (!ar) cr.style.bottom = clamp(0, rect.offsetBottom - dy, rect.offsetBottom + rect.offsetHeight - minSize) + 'px'
    else {
      if (_right || _left) {
        cr.style.top = cr.offsetTop + 'px'
        cr.style.bottom = 'auto'
      }
    }
  }
  if (_left) {
    if (!ar) cr.style.left = clamp(0, rect.offsetLeft + dx, rect.offsetLeft + rect.offsetWidth - minSize) + 'px'
    else {
      if (_top) cr.style.left = clamp(Math.max(0, box.width - rect.offsetRight - (rect.offsetTop + rect.offsetHeight) * ratio), rect.offsetLeft + dx, rect.offsetLeft + rect.offsetWidth - minSize) + 'px'
      else cr.style.left = clamp(Math.max(0, box.width - rect.offsetRight - (box.height - rect.offsetTop) * ratio), rect.offsetLeft + dx, rect.offsetLeft + rect.offsetWidth - minSize) + 'px'
    }
  }
  if (_right) {
    if (!ar) cr.style.right = clamp(0, rect.offsetRight - dx, rect.offsetRight + rect.offsetWidth - minSize) + 'px'
    else {
      if (_top) cr.style.right = clamp(Math.max(0, box.width - rect.offsetLeft - (rect.offsetTop + rect.offsetHeight) * ratio), rect.offsetRight - dx, rect.offsetRight + rect.offsetWidth - minSize) + 'px'
      else cr.style.right = clamp(Math.max(0, box.width - rect.offsetLeft - (box.height - rect.offsetTop) * ratio), rect.offsetRight - dx, rect.offsetRight + rect.offsetWidth - minSize) + 'px'
    }
  }

  if (!_top && !_bottom && !_left && !_right) {
    cr.style.top = clamp(0, rect.offsetTop + dy, box.height - rect.offsetHeight) + 'px'
    cr.style.bottom = clamp(0, rect.offsetBottom - dy, box.height - rect.offsetHeight) + 'px'
    cr.style.left = clamp(0, rect.offsetLeft + dx, box.width - rect.offsetWidth) + 'px'
    cr.style.right = clamp(0, rect.offsetRight - dx, box.width - rect.offsetWidth) + 'px'
  }
}

function dragStop(e) {
  dragging = false
  const crop = cropRef.value
  crop.releasePointerCapture(e.pointerId)
  crop.removeEventListener('pointermove', drag)
  crop.removeEventListener('pointerup', dragStop)
  const r = updateRect()
  rect = r.rect
  props.params.crop.currentcrop = rect
  if (props.onCropUpdate) props.onCropUpdate(rect)
}

onMounted(() => {
  const crop = cropRef.value
  if (!crop) return
  crop.addEventListener('pointerdown', dragStart)
  nextTick(() => {
    resetCropRect()
  })
})

onUnmounted(() => {
  const crop = cropRef.value
  if (crop) crop.removeEventListener('pointerdown', dragStart)
})

watch(() => props.params.crop.ar, (ar) => {
  nextTick(() => {
    if (ar && croprectRef.value) {
      croprectRef.value.style.aspectRatio = ar
      showTopBottom.value = false
    } else if (croprectRef.value) {
      croprectRef.value.style.aspectRatio = ''
      showTopBottom.value = true
    }
  })
})

watch(() => props.params.crop.currentcrop, (currentcrop) => {
  nextTick(() => resetCropRect(currentcrop || null))
})

defineExpose({ resetCropRect })
</script>

<style>
#crop {
  position: absolute;
}
.cropcorner {
  z-index: 2 !important;
}

#croprect {
  border: solid 1px light-dark(black, white);
  background-size: 33.33333% 33.33333%;
  background-image:
    linear-gradient(to right, grey 1.5px, transparent 1px),
    linear-gradient(to bottom, grey 1.5px, transparent 1px);
  position: absolute;
  box-shadow: 0 0 0 9999px light-dark(rgba(255, 255, 255, 0.8), rgba(0, 0, 0, 0.8));
  cursor: move;
  max-height: 100%;
  max-width: 100%;
}

#croprect div {
  position: absolute;
  width: 40px;
  height: 40px;
  border-color: light-dark(black, white);
  border-style: solid;
}
#croprect #top_left {
  top: 0px; left: 0px;
  border-width: 3px 0px 0px 3px;
  cursor: nwse-resize;
}
#croprect #top_right {
  top: 0px; right: 0px;
  border-width: 3px 3px 0px 0px;
  cursor: nesw-resize;
}
#croprect #bottom_right {
  bottom: 0px; right: 0px;
  border-width: 0px 3px 3px 0px;
  cursor: nwse-resize;
}
#croprect #bottom_left {
  bottom: 0px; left: 0px;
  border-width: 0px 0px 3px 3px;
  cursor: nesw-resize;
}
#croprect #top {
  top: 0px; right: calc(50% - 20px);
  border-width: 3px 0px 0px 0px;
  cursor: ns-resize;
}
#croprect #bottom {
  bottom: 0px; right: calc(50% - 20px);
  border-width: 0px 0px 3px 0px;
  cursor: ns-resize;
}
#croprect #left {
  top: calc(50% - 20px); left: 0px;
  border-width: 0px 0px 0px 3px;
  cursor: ew-resize;
}
#croprect #right {
  top: calc(50% - 20px); right: 0px;
  border-width: 0px 3px 0px 0px;
  cursor: ew-resize;
}
</style>
