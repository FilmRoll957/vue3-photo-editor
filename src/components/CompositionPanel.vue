<template>
  <Section
    sectionname="composition"
    :height="260"
    :params="params"
    :onReset="() => resetComposition()"
    :resetDisabled="false"
  >
    <button class="done_btn" @click.stop="sel = ''">完成</button>
    <div style="display:flex;justify-content: flex-end;color:grey; margin-right: 3px;">
      <div style="flex: 1; align-content: center; text-align: left;">
        <span>旋转 </span>
        <input id="trs_angle_" style="width:75px;" type="number" class="rangenumb" step="0.25" min="-45" max="45" v-model.number="params.trs.angle" @input="setTRSdebounce" />
        <input id="trs_angle" type="range" v-model.number="params.trs.angle" min="-45" max="45" step="0.25" @input="setTRSdebounce" @dblclick="resetAngle" />
      </div>

      <button id="fliph" class="crop_btn" title="水平翻转" :selected="!!params.trs.fliph || undefined" @click="flip('h')" v-html="icon_flip" />
      <button id="flipv" class="crop_btn" title="垂直翻转" :selected="!!params.trs.flipv || undefined" @click="flip('v')" style="rotate: 270deg;" v-html="icon_flip" />
      <button class="crop_btn" title="左转" @click="rotateCanvas(-90)" v-html="icon_rotate" />
      <button class="crop_btn" title="透视" :selected="showPerspective || undefined" @click="togglePerspective" v-html="icon_skew" />
    </div>

    <div v-if="showPerspective">
      <hr>
      <div style="text-align:center;color:darksalmon;">
        <template v-if="!params.perspective2.before">
          定位角点 然后 <button @click="lockPerspective">锁定矩形</button>
        </template>
        <template v-else>
          拖拽角点
        </template>
      </div>
      <PerspectiveWidget :canvas="canvas" :persp="persp" @update="onPerspUpdate" />
    </div>

    <hr>
    <div style="text-align:left;color:gray;">裁剪比例</div>
    <div style="text-align:left;" id="aspects">
      <button
        v-for="(ar, idx) in arlist"
        :key="ar"
        :id="'ar_' + idx"
        class="crop_btn"
        :selected="idx === params.crop.arindex || undefined"
        @click="selectAR(idx)"
        @dblclick="resetCropRect"
      >{{ ar }}</button>
    </div>

    <hr>
    <div style="text-align:left;color:gray;">图片尺寸</div>
    <div style="display:flex;justify-content: space-around;align-items: center;">
      <div style="width:100px;text-align:left;color:gray;">({{ resizeperc }}%)</div>
      <input id="resize_width" type="number" v-model.number="resizeWidth" style="text-align:center;width:90px;" @change="setWidth">
      x
      <input id="resize_height" type="number" v-model.number="resizeHeight" style="text-align:center;width:90px;" @change="setHeight">
    </div>
  </Section>
</template>

<script setup>
import { ref, inject, onMounted, computed } from 'vue'
import Section from './Section.vue'
import PerspectiveWidget from './PerspectiveWidget.vue'
import icon_flip from '../assets/icon_flip.svg?raw'
import icon_rotate from '../assets/icon_rotate.svg?raw'
import icon_skew from '../assets/icon_skew.svg?raw'

const sel = inject('sel')

const props = defineProps({
  params: { type: Object, required: true },
  onUpdate: { type: Function, required: true },
  getMiniGl: { type: Function, required: true },
  centerCanvas: { type: Function, required: true },
  canvas: { type: Object },
})

const showPerspective = ref(false)
const persp = ref({
  quad: [[0.25, 0.25], [0.75, 0.25], [0.75, 0.75], [0.25, 0.75]],
  modified: 0
})

const arlist = ['free', 'pic', '1:pic', '1:1', '4:3', '16:9', '3:4', '9:16']
const arsvalues = [0, 0, 0, 1, 4 / 3, 16 / 9, 3 / 4, 9 / 16]

let _minigl = null

onMounted(() => {
  const _m = props.getMiniGl()
  if (_m) {
    _minigl = _m
    arsvalues[1] = _m.gl.canvas.width / _m.gl.canvas.height
    arsvalues[2] = 1 / arsvalues[1]
  }
})

const resizeWidth = ref(0)
const resizeHeight = ref(0)

onMounted(() => {
  if (_minigl) {
    resizeWidth.value = _minigl.width
    resizeHeight.value = _minigl.height
  }
})

const resizeperc = computed(() => {
  if (!_minigl) return 100
  return Math.round(resizeWidth.value / _minigl.img.naturalWidth * 1000) / 10
})

function selectAR(idx) {
  hidePerspective()
  props.params.crop.arindex = idx
  props.params.crop.ar = arsvalues[idx]
  const croprect = document.getElementById('croprect')
  if (croprect) croprect.style.aspectRatio = arsvalues[idx]
  const aspects = document.getElementById('aspects')
  if (aspects) {
    aspects.querySelector('[selected]')?.removeAttribute('selected')
    aspects.querySelector('#ar_' + idx)?.setAttribute('selected', true)
  }
  props.onUpdate()
}

function flip(dir) {
  if (dir === 'h') props.params.trs.fliph = 1 - props.params.trs.fliph
  else props.params.trs.flipv = 1 - props.params.trs.flipv
  props.onUpdate()
}

function rotateCanvas(deg) {
  if (!_minigl) _minigl = props.getMiniGl()
  props.params.crop.canvas_angle = (props.params.crop.canvas_angle + deg) % 360
  const { width, height } = _minigl
  if (props.params.crop.canvas_angle % 180) {
    _minigl.gl.canvas.width = height
    _minigl.gl.canvas.height = width
  } else {
    _minigl.gl.canvas.width = width
    _minigl.gl.canvas.height = height
  }
  _minigl.setupFiltersTextures()
  props.centerCanvas()
  resetCropRect()
  hidePerspective()
  props.onUpdate()
}

function togglePerspective() {
  if (showPerspective.value) hidePerspective()
  else showPerspective()
}

async function showPersp() {
  showPerspective.value = true
}

function hidePerspective() {
  showPerspective.value = false
}

function lockPerspective() {
  if (!props.params.perspective2.before) return
  props.params.perspective2.after = 0
  showPerspective.value = true
}

function onPerspUpdate(points) {
  persp.value.quad = points
  persp.value.modified = 1
  props.onUpdate()
}

function resetCropRect() {
  const croprect = document.getElementById('croprect')
  if (croprect) croprect.style.inset = '0'
  props.params.crop.currentcrop = 0
  props.onUpdate()
}

function resetAngle() {
  props.params.trs.angle = 0
  props.params.trs.scale = 0
  props.onUpdate()
}

let trsTimer
function setTRSdebounce() {
  const angle = Math.abs(props.params.trs.angle)
  if (angle > 0 && _minigl) {
    const rad = angle * Math.PI / 180
    const cw = _minigl.gl.canvas.width
    const ch = _minigl.gl.canvas.height
    const newwidth = cw * Math.cos(rad) + ch * Math.sin(rad)
    const newheight = cw * Math.sin(rad) + ch * Math.cos(rad)
    props.params.trs.scale = Math.max(newwidth / cw - 1, newheight / ch - 1)
  } else {
    props.params.trs.scale = 0
  }
  clearTimeout(trsTimer)
  trsTimer = setTimeout(() => props.onUpdate(), 30)
}

function resetComposition() {
  sel.value = ''
  Object.keys(props.params.crop).forEach(e => { props.params.crop[e] = 0 })
  selectAR(0)
  Object.keys(props.params.trs).forEach(e => { props.params.trs[e] = 0 })
  Object.keys(props.params.perspective2).forEach(e => { props.params.perspective2[e] = 0 })
  hidePerspective()
  resetCropRect()
  if (_minigl) _minigl.resetResize()
  props.params.resizer.width = 0
  props.params.resizer.height = 0
  resizeWidth.value = _minigl ? _minigl.width : 0
  resizeHeight.value = _minigl ? _minigl.height : 0
  props.onUpdate()
}

function resize(newwidth, newheight) {
  if (!_minigl) _minigl = props.getMiniGl()
  props.params.resizer.width = newwidth
  props.params.resizer.height = newheight
  resizeWidth.value = newwidth
  resizeHeight.value = newheight
  _minigl.resize(newwidth, newheight)
  resetCropRect()
  props.onUpdate()
}

function setWidth() {
  if (!_minigl) _minigl = props.getMiniGl()
  const ar = arsvalues[1]
  const w = Math.max(100, resizeWidth.value)
  const h = Math.floor(w / ar)
  resize(w, h)
}

function setHeight() {
  if (!_minigl) _minigl = props.getMiniGl()
  const ar = arsvalues[1]
  const h = Math.max(100, resizeHeight.value)
  const w = Math.floor(h * ar)
  resize(w, h)
}
</script>

<style scoped>
.crop_btn {
  width: 38px;
  color: white;
  padding: 0;
  margin: 2px;
  border-radius: 50%;
  fill: white;
  stroke: white;
  font-size: 12px;
}

.done_btn {
  position: absolute;
  top: 8px;
  right: 60px;
  width: 40px;
  height: 20px;
  padding: 0;
  z-index: 10;
  background: var(--accent-strong);
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.rangenumb {
  width: 55px;
  text-align: center;
}
</style>
