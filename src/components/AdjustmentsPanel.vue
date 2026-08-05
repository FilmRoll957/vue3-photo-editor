<template>
  <div class="adjustments-panel">
    <Section
      v-for="sec in sections"
      :key="sec"
      :sectionname="sec"
      :height="heights[sec]"
      :params="params"
      :onEnable="(flag) => { if (!flag) onUpdate?.() }"
      :onReset="() => resetSectionBySec(sec)"
      :resetDisabled="checkParamsZero(sec)"
    >
      <div v-for="key in getKeys(sec)" :key="key" style="display:flex;justify-content:space-between;align-items:center;gap:4px;">
        <div class="rangelabel">{{ keyLabels[key] || key }}</div>
        <input
          :id="sec + '_' + key"
          type="range" style="width:120px;"
          :value="params[sec][key]"
          min="-1" max="1" step="0.01"
          @input="(e) => setParam(e, sec, key)"
          @dblclick="(e) => resetParam(e, sec, key)"
        >
        <input
          :id="sec + '_' + key + '_'"
          type="number" class="rangenumb"
          :value="params[sec][key]"
          min="-1" max="1" step="0.01"
          @input="(e) => setParam(e, sec, key)"
        >
      </div>
    </Section>
  </div>
</template>

<script setup>
import { inject } from 'vue'
import Section from './Section.vue'
import { debounce } from '../js/tools.js'

const sel = inject('sel')

const props = defineProps({
  params: { type: Object, required: true },
  onUpdate: { type: Function, default: null },
})

const sections = ['lights', 'colors', 'effects']
const heights = { lights: 230, colors: 180, effects: 130 }

const keyLabels = {
  brightness: '亮度',
  exposure: '曝光',
  gamma: '伽马',
  contrast: '对比度',
  shadows: '阴影',
  highlights: '高光',
  bloom: '泛光',
  temperature: '色温',
  tint: '色调',
  vibrance: '自然饱和度',
  saturation: '饱和度',
  sepia: '怀旧',
  clarity: '清晰度',
  noise: '噪点',
  vignette: '暗角',
}

function getKeys(sec) {
  return Object.keys(props.params[sec] || {}).filter(k => !k.startsWith('$'))
}

function checkParamsZero(sec) {
  return getKeys(sec).every(k => props.params[sec][k] === 0)
}

function setParam(e, sec, key) {
  const val = parseFloat(e.target.value)
  debounce(sec + '_' + key, () => {
    props.params[sec][key] = val
    props.onUpdate?.()
  }, 30)
}

function resetParam(e, sec, key) {
  props.params[sec][key] = 0
  props.onUpdate?.()
}

function resetSectionBySec(sec) {
  getKeys(sec).forEach(k => { props.params[sec][k] = 0 })
  props.onUpdate?.()
}
</script>
