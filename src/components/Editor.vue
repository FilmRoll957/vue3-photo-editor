<template>
  <div class="minieditor">
    <div class="app">
      <template v-if="!file && !importData">
        <div class="main landing">
          <div class="hero_card">
            <div class="hero_meta">
              <span class="hero_index">N°01 — Photo Editor</span>
              <span class="hero_version">v0.1.0 · 2026</span>
            </div>
            <h1>Vue3 <em>Photo</em>Editor</h1>
            <p class="hero_subtitle">专业级在线照片编辑器 —— 所有图像处理在浏览器本地完成，无上传、无依赖。</p>
            <div class="hero_actions">
              <ClickDropFile text="点击或拖放载入图片" accept="image/*" @file="(f) => readImage(f, onImageLoaded)" style="height:120px;width:220px;white-space:nowrap;" />
              <button v-if="showSamples" style="height:120px;width:120px;white-space:nowrap;" @click="samples">示例图片</button>
            </div>
            <div class="hero_features">
              <div class="hero_feature">
                <span class="feat_num">01</span>
                <span class="feat_body"><b>100% 隐私离线</b><em>所有运算在浏览器本地完成，图像不上传任何服务器</em></span>
              </div>
              <div class="hero_feature">
                <span class="feat_num">02</span>
                <span class="feat_body"><b>免费开源</b><em>源代码完全开放，可自由使用、审查与修改</em></span>
              </div>
              <div class="hero_feature">
                <span class="feat_num">03</span>
                <span class="feat_body"><b>无需注册</b><em>打开即用，不收集任何用户信息或 Cookie</em></span>
              </div>
            </div>
            <div class="hero_qrcode">
              <div class="qrcode_box">
                <img :src="qrcodeImg" alt="公众号二维码" />
                <span class="qrcode_caption">扫码关注公众号</span>
              </div>
            </div>
          </div>
        </div>
      </template>

      <template v-if="file">
        <div class="header" :style="importData ? 'backdrop-filter: unset;' : ''">
          <div class="banner">
            {{ store.appName }}
          </div>
          <div></div>
          <div style="display:flex;">
            <div class="btn_fullscreen"><FullscreenBtn /></div>
            <div class="btn_theme"><ThemeToggle /></div>
          </div>
        </div>

        <div class="main">
          <div class="container">
            <div class="sidebar" @click="sidebarClick">
              <div class="menubuttons">
                <div style="display:flex;align-items:center;justify-content:center;">
                  <template v-if="!importData">
                    <ClickDropFile text="上传" accept="image/*" @file="(f) => readImage(f, onImageLoaded)" style="width:105px;height:30px;" />
                  </template>
                  <template v-if="!!importData">
                    <button style="width:105px;height:30px;" @click="() => importData.cb()">取消</button>
                  </template>
                  <button style="width:105px;height:30px;display:inline-flex;align-items:center;justify-content:center;gap:5px;" id="btn_download" @click="showDownloadDialog"><i class="fa-solid fa-download" style="font-size:11px;"></i>下载</button>
                </div>
                <div style="display:flex;align-items:center;justify-content:center;gap:4px;">
                  <button style="height:30px;font-size:12px;display:inline-flex;align-items:center;gap:3px;padding:0 8px;" id="btn_info" @click="showInfoDialog" title="文件信息">
                    <span style="width:14px;height:14px;display:inline-flex;flex-shrink:0;color:inherit;" v-html="infoIcon"></span>信息
                  </button>
                  <button style="height:30px;font-size:12px;display:inline-flex;align-items:center;gap:3px;padding:0 8px;" id="btn_histo" @click="toggleHisto" :selected="!!showHisto" title="直方图">
                    <span style="width:14px;height:14px;display:inline-flex;flex-shrink:0;color:inherit;" v-html="histoIcon"></span>直方图
                  </button>
                  <button style="height:30px;font-size:12px;display:inline-flex;align-items:center;gap:3px;padding:0 8px;" id="btn_split" @click="toggleSplitView" :selected="!!showSplit" title="分割视图">
                    <span style="width:14px;height:14px;display:inline-flex;flex-shrink:0;color:inherit;" v-html="splitIcon"></span>对比
                  </button>
                </div>
              </div>

              <div class="menusections">
                <CompositionPanel :params="params" :onUpdate="updateGL" :getMiniGl="() => _minigl" :centerCanvas="centerCanvas" :canvas="canvasRef" />
                <AdjustmentsPanel :params="params" :onUpdate="updateGL" />
                <CurvesPanel :params="params" :onUpdate="updateGL" />
                <FiltersPanel :params="params" :onUpdate="updateGL" />
                <BlenderPanel :params="params" :onUpdate="updateGL" />
                <BlurPanel :params="params" :onUpdate="updateGL" />
                <RecipesPanel :params="params" :onUpdate="updateGL" />
                <HealPanel :params="params" :onUpdate="updateGL" />
              </div>
            </div>

            <div id="editor" class="editor" @click.self="sidebarClick">
              <div id="zoomable" @dblclick.stop="canvasDblClick" @click="canvasClick">
                <div id="pannable">
                  <canvas ref="canvasRef" id="canvas" class="checkered"></canvas>
                  <template v-if="showSplit">
                    <SplitViewWidget :image="splitimage" />
                  </template>
                  <template v-if="sel === 'composition'">
                    <CropperCanvas :canvas="canvasRef" :params="params" :onCropUpdate="onCropUpdate" />
                  </template>
                </div>
              </div>
            </div>
          </div>

          <template v-if="showHisto && file">
            <HistogramWidget @ready="onHistoReady" />
          </template>
    </div>

    <teleport to="body">
      <div v-if="showDownload" class="modal_overlay" @click.self="showDownload = false">
        <div class="modal_dialog">
          <h3 style="margin-top:0;">保存图片</h3>
          <div style="display:flex;flex-direction:column;gap:8px;">
            <div style="display:flex;align-items:center;gap:8px;">
              <label>文件名:</label>
              <input v-model="downloadFilename" style="flex:1;" />
            </div>
            <div style="display:flex;align-items:center;gap:8px;">
              <label>格式:</label>
              <select v-model="downloadFormat">
                <option value="jpeg">JPEG</option>
                <option value="png">PNG</option>
              </select>
              <template v-if="downloadFormat === 'jpeg'">
                <label>质量:</label>
                <input type="range" v-model.number="downloadQuality" min="0.1" max="1" step="0.01" style="width:80px;" />
                <span>{{ Math.round(downloadQuality * 100) }}%</span>
              </template>
            </div>
            <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:8px;">
              <button @click="showDownload = false">取消</button>
              <button @click="doDownload" style="background:var(--accent-strong);">下载</button>
            </div>
          </div>
        </div>
      </div>
    </teleport>

    <teleport to="body">
      <div v-if="showInfo" class="modal_overlay" @click.self="showInfo = false">
        <div class="modal_dialog" style="max-width:400px;max-height:80vh;">
          <h3 style="margin-top:0;">文件信息</h3>
          <div style="font-size:12px;line-height:1.8;text-align:left;max-height:60vh;overflow-y:auto;">
            <div v-if="fileInfo"><b class="info_section">FILE</b></div>
            <div v-if="fileInfo">名称: {{ fileInfo.name }}</div>
            <div v-if="fileInfo">尺寸: {{ fileInfo.width }} x {{ fileInfo.height }} ({{ fileInfo.hsize }})</div>
            <div v-if="fileInfo">色彩: {{ fileInfo.colorspace }}</div>
            <div v-if="fileInfo?.date">日期: {{ fileInfo.date }}</div>

            <template v-if="fileInfo?.tiff && Object.keys(fileInfo.tiff).length">
              <div><b class="info_section">TIFF</b></div>
              <div v-for="(v, k) in sortedEntries(fileInfo.tiff)" :key="'tiff_' + k">{{ k }}: {{ v.hvalue || v.value }}</div>
            </template>

            <template v-if="fileInfo?.exif && Object.keys(fileInfo.exif).length">
              <div><b class="info_section">EXIF</b></div>
              <div v-for="(v, k) in sortedEntries(fileInfo.exif)" :key="'exif_' + k">{{ k }}: {{ v.hvalue || v.value }}</div>
            </template>
          </div>
          <div style="display:flex;justify-content:flex-end;margin-top:12px;">
            <button @click="showInfo = false">关闭</button>
          </div>
        </div>
      </div>
    </teleport>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, h, provide, toRaw } from 'vue'
import { useEditorStore } from '../stores/editor.js'
import miniExif from '@xdadda/mini-exif'
import { minigl } from '@xdadda/mini-gl'
import infoIcon from '../assets/icon_info.svg?raw'
import histoIcon from '../assets/icon_histo.svg?raw'
import splitIcon from '../assets/icon_split.svg?raw'

import { zoom_pan } from '../js/zoom_pan.js'
import { readImage, filesizeString } from '../js/tools.js'
import InpaintTelea from '../js/inpaint.js'

import ClickDropFile from './ClickDropFile.vue'
import ThemeToggle from './ThemeToggle.vue'
import FullscreenBtn from './FullscreenBtn.vue'
import Section from './Section.vue'

import CompositionPanel from './CompositionPanel.vue'
import AdjustmentsPanel from './AdjustmentsPanel.vue'
import CurvesPanel from './CurvesPanel.vue'
import FiltersPanel from './FiltersPanel.vue'
import BlenderPanel from './BlenderPanel.vue'
import BlurPanel from './BlurPanel.vue'
import RecipesPanel from './RecipesPanel.vue'
import HealPanel from './HealPanel.vue'
import qrcodeImg from '../assets/444.png'

import CropperCanvas from './CropperCanvas.vue'
import HistogramWidget from './HistogramWidget.vue'
import SplitViewWidget from './SplitViewWidget.vue'

const props = defineProps({
  input: { default: false },
  showSamples: { type: Boolean, default: false }
})

const store = useEditorStore()

const canvasRef = ref(null)
const file = ref(null)
const showHisto = ref(false)
const showSplit = ref(false)
const sel = ref(null)
provide('sel', sel)
let _exif, _minigl, zp, updateHistogram, splitimage, splitwidth, cropping

const params = reactive({
  trs: { translateX: 0, translateY: 0, angle: 0, scale: 0, flipv: 0, fliph: 0 },
  crop: { currentcrop: 0, glcrop: 0, canvas_angle: 0, ar: 0, arindex: 0 },
  lights: { brightness: 0, exposure: 0, gamma: 0, contrast: 0, shadows: 0, highlights: 0, bloom: 0 },
  colors: { temperature: 0, tint: 0, vibrance: 0, saturation: 0, sepia: 0 },
  effects: { clarity: 0, noise: 0, vignette: 0 },
  curve: { curvepoints: 0 },
  filters: { opt: 0, mix: 0 },
  perspective: { quad: 0, modified: 0 },
  perspective2: { before: 0, after: 0, modified: 0 },
  blender: { blendmap: 0, blendmix: 0.5 },
  resizer: { width: 0, height: 0 },
  blur: { bokehstrength: 0, bokehlensout: 0.5, gaussianstrength: 0, centerX: 0.5, centerY: 0.5 },
  heal: { healmask: 0 },
})

async function onImageLoaded(arrayBuffer, filedata, img) {
  if (file.value) resetAll()
  try { _exif = await miniExif(arrayBuffer) } catch (e) { console.error(e) }
  let meta = _exif?.read() || {}
  if (meta.xml) meta.xml = meta.xml.slice(meta.xml.indexOf('<')).replace(/ +(?= )/g, '').replace(/\r\n|\n|\r/gm, '')
  meta.file = { ...filedata, hsize: filesizeString(filedata.size), width: img?.width || '-', height: img?.height || '-' }
  meta.img = img
  meta.colorspace = meta.icc?.ColorProfile?.[0].includes('P3') ? 'display-p3' : 'srgb'
  file.value = meta
  await nextTick()
  initCanvas()
}

function resetAll() {
  sel.value = null
  showHisto.value = false
  showSplit.value = false
  splitwidth = 0.5
  for (const s in params) {
    for (const v in params[s]) params[s][v] = 0
  }
}

function initCanvas() {
  try {
    if (_minigl?.destroy) _minigl.destroy()
    _minigl = minigl(document.getElementById('canvas'), file.value.img, file.value.colorspace)
    params._minigl = _minigl
    if (zp) zp()
    zp = zoom_pan(document.getElementById('zoomable'), document.getElementById('pannable'))
    updateGL()
    centerCanvas()
  } catch (e) { console.error(e) }
}

function centerCanvas() {
  const canvas = document.getElementById('canvas')
  const editor = document.getElementById('editor')
  const zoomable = document.getElementById('zoomable')
  const pannable = document.getElementById('pannable')
  if (!canvas || !editor) return
  const canvasAR = canvas.width / canvas.height
  if (editor.offsetWidth / canvasAR > editor.offsetHeight) {
    canvas.style.height = '99%'
    canvas.style.width = ''
  } else {
    canvas.style.width = '99%'
    canvas.style.height = ''
  }
  zoomable.style.transform = ''
  pannable.style.transform = ''
}

async function updateGL() {
  if (!_minigl) return
  _minigl.loadImage()

  if (params.heal.healit) {
    const mask_u8 = params.heal.healmask
    const data = _minigl.readPixels()
    const w = _minigl.width, h = _minigl.height
    for (var channel = 0; channel < 3; channel++) {
      var img_u8 = new Uint8Array(w * h)
      for (var n = 0; n < data.length; n += 4) img_u8[n / 4] = data[n + channel]
      InpaintTelea(w, h, img_u8, mask_u8)
      for (var i = 0; i < img_u8.length; i++) {
        data[4 * i + channel] = img_u8[i]
        if (channel === 0) data[4 * i + 3] = 255
      }
    }
    const newimgdata = new ImageData(new Uint8ClampedArray(data.buffer), w, h)
    _minigl.loadImage(newimgdata)
    params.heal.healit = 0
  }

  params.trs.angle += params.crop.canvas_angle
  _minigl.filterMatrix(params.trs)
  params.trs.angle -= params.crop.canvas_angle

  if (params.perspective2.after) {
    let before = params.perspective2.before.map(e => [e[0] * _minigl.width, e[1] * _minigl.height])
    let after = params.perspective2.after.map(e => [e[0] * _minigl.width, e[1] * _minigl.height])
    _minigl.filterPerspective(before, after, false, false)
  }

  if (params.crop.glcrop) {
    _minigl.crop(params.crop.glcrop)
    params.crop.glcrop = 0
    return updateGL()
  }

  if (!params.blender.$skip && params.blender.blendmap) _minigl.filterBlend(params.blender.blendmap, params.blender.blendmix)

  let adjparams = {}
  if (!params.lights.$skip) adjparams = { ...adjparams, ...params.lights }
  if (!params.colors.$skip) adjparams = { ...adjparams, ...params.colors }
  if (!params.effects.$skip) adjparams = { ...adjparams, ...params.effects }
  _minigl.filterAdjustments({ ...adjparams })

  if (adjparams.bloom) _minigl.filterBloom(adjparams.bloom)
  if (adjparams.noise) _minigl.filterNoise(adjparams.noise)
  if (adjparams.shadows || adjparams.highlights) _minigl.filterHighlightsShadows(adjparams.highlights || 0, -adjparams.shadows || 0)

  if (!params.curve.$skip && params.curve.curvepoints) _minigl.filterCurves(params.curve.curvepoints)
  if (!params.filters.$skip && params.filters.opt) _minigl.filterInsta(params.filters.opt, params.filters.mix)

  if (!params.blur.$skip && params.blur.bokehstrength) _minigl.filterBlurBokeh(params.blur)
  if (!params.blur.$skip && params.blur.gaussianstrength) {
    params.blur.gaussianlensout = params.blur.bokehlensout
    _minigl.filterBlurGaussian(params.blur)
  }

  _minigl.paintCanvas()
  if (updateHistogram) updateHistogram()
}

function canvasDblClick(e) {
  e?.preventDefault()
  centerCanvas()
}

let lastclick = 0
function canvasClick(e) {
  e.preventDefault()
  if (lastclick && (Date.now() - lastclick) < 200) return canvasDblClick(e)
  lastclick = Date.now()
}

function sidebarClick() {
  sel.value = ''
}

function onCropUpdate() {
  if (Object.values(params.trs).reduce((p, v) => p += v, 0) === 0 && Object.values(params.crop).reduce((p, v) => p += v, 0) === 0 && params.perspective2.modified == 0 && params.resizer.width === 0) {
    document.getElementById('btn_reset_composition')?.setAttribute('disabled', true)
  } else {
    document.getElementById('btn_reset_composition')?.removeAttribute('disabled')
  }
}

const importData = props.input?.data ? props.input : null
if (importData) {
  nextTick(async () => {
    await openInput(importData.data, importData.name)
  })
}

async function openInput(data, name) {
  if (!data) return
  try {
    let arrayBuffer, blob, img, info = { name }
    if (typeof data === 'string' && data.startsWith('http')) {
      const resp = await fetch(data)
      if (resp.status !== 200) return console.error(await resp.json())
      arrayBuffer = await resp.arrayBuffer()
    } else if (data instanceof Image) {
      const resp = await fetch(data.src)
      arrayBuffer = await resp.arrayBuffer()
      img = data
    } else if (data instanceof ArrayBuffer) {
      arrayBuffer = data
    } else if (data instanceof Blob) {
      blob = data
      arrayBuffer = await data.arrayBuffer()
    } else return console.error('Unknown data type')
    info.size = arrayBuffer.byteLength
    if (!blob) blob = new Blob([arrayBuffer])
    if (!img) {
      img = new Image()
      img.src = URL.createObjectURL(blob)
      await img.decode()
    }
    onImageLoaded(arrayBuffer, info, img)
  } catch (e) {
    console.error(e)
  }
}

const showDownload = ref(false)
const showInfo = ref(false)
const fileInfo = ref({ name: '', width: 0, height: 0, hsize: '' })
const downloadFilename = ref('')
const downloadFormat = ref('jpeg')
const downloadQuality = ref(0.9)

function toggleHisto() {
  showHisto.value = !showHisto.value
}

function toggleSplitView() {
  if (showSplit.value) {
    showSplit.value = false
  } else {
    splitimage = _minigl.img_cropped || _minigl.img
    showSplit.value = true
  }
}

function onHistoReady(drawHistogram) {
  updateHistogram = drawHistogram
  updateGL()
}

function showDownloadDialog() {
  sel.value = ''
  const meta = file.value
  if (!meta) return
  downloadFilename.value = meta.file.name.replace(/\.[^.]+$/, '')
  downloadQuality.value = 0.9
  downloadFormat.value = 'jpeg'
  showDownload.value = true
}

async function doDownload() {
  if (!_minigl) return
  try {
    const format = downloadFormat.value === 'png' ? 'png' : 'jpeg'
    const quality = format === 'jpeg' ? parseFloat(downloadQuality.value) : 1
    const img = _minigl.captureImage('image/' + format, quality)
    const canvas = document.createElement('canvas')
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0)
    const blob = await new Promise(r => canvas.toBlob(r, 'image/' + format, quality))
    let exifData
    try { exifData = _exif?.raw } catch(e) {}
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = downloadFilename.value + '.' + format
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    showDownload.value = false
  } catch(e) { console.error(e) }
}

async function showInfoDialog(e) {
  e?.stopPropagation()
  sel.value = ''
  const meta = file.value
  if (!meta) return
  const exifEntries = {}
  if (meta.exif) {
    Object.entries(meta.exif).forEach(([k, v]) => { exifEntries[k] = v })
  }
  fileInfo.value = {
    name: meta.file.name,
    width: meta.file.width,
    height: meta.file.height,
    hsize: meta.file.hsize,
    colorspace: meta.colorspace,
    date: meta.exif?.DateTimeOriginal?.value || new Date(meta.file.lastModified).toLocaleString(),
    tiff: meta.tiff || null,
    exif: exifEntries || null,
  }
  showInfo.value = true
}

function sortedEntries(obj) {
  if (!obj) return []
  return Object.entries(obj).sort((a, b) => String(a[0]).localeCompare(String(b[0])))
}

async function samples() {
  const html = `
<div style="position:relative;height:250px;overflow:auto;">
  <img id="snail.jpg" onclick="this.closest('.alert-message').remove()" style="cursor:pointer;position:absolute;top:50px;left:20px;border-radius:10px;" src="/samples/snail-8577681_1280.jpg" width=130>
  <img id="seagull.png" style="cursor:pointer;position:absolute;top:50px;left:160px;border-radius:10px;" src="/samples/seagull-8547189_1280.png" width=150>
</div>`
}

const TempMount = {
  props: ['factory'],
  setup(p) {
    const el = ref(null)
    return () => {
      if (p.factory.value && el.value) {
        nextTick(() => { el.value.appendChild(p.factory.value._el || p.factory.value) })
      }
      return h('div', { ref: el })
    }
  }
}
</script>

<style scoped>
@import './app.css';
</style>

<style>
@import './editor.css';

.modal_overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: overlayIn 0.25s ease both;
}

@keyframes overlayIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.modal_dialog {
  background: light-dark(rgba(255, 255, 255, 0.88), rgba(27, 39, 64, 0.9));
  backdrop-filter: blur(24px) saturate(1.3);
  -webkit-backdrop-filter: blur(24px) saturate(1.3);
  border-radius: 16px;
  padding: 22px;
  min-width: 320px;
  max-width: 90vw;
  border: 1px solid light-dark(rgba(255, 255, 255, 0.5), rgba(120, 160, 220, 0.18));
  box-shadow: 0 16px 48px rgba(8, 15, 35, 0.35), inset 0 1px 0 light-dark(rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.06));
  animation: dialogIn 0.35s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes dialogIn {
  from { opacity: 0; transform: scale(0.95) translateY(10px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}

.modal_dialog label {
  font-size: 13px;
  color: light-dark(#5a6a80, rgba(255, 255, 255, 0.5));
  min-width: 60px;
  font-weight: 500;
}

#btn_info span svg,
#btn_histo span svg,
#btn_split span svg {
  fill: currentColor;
  width: 100%;
  height: 100%;
}

.info_section {
  display: block;
  margin-top: 8px;
  color: var(--accent-strong);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 1px;
  text-transform: uppercase;
  border-bottom: 1px solid var(--hairline);
  padding-bottom: 4px;
}
</style>
