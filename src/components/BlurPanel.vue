<template>
  <Section
    sectionname="blur"
    :height="150"
    :params="params"
    :onEnable="flag => onUpdate?.()"
    :onReset="() => resetSection('blur')"
    :resetDisabled="checkParamsZero"
  >
    <div v-if="showmouse" style="text-align:left;color:gray;"><i>(中心红点)</i></div>
    <div v-for="(label, idx) in blurlabels" :key="label" style="display:flex;justify-content:flex-start;align-items:center;gap:4px;">
      <div class="rangelabel">{{ label }}</div>
      <input :id="'blur_' + blurkeys[idx]" style="width:130px;" type="range" :value="params.blur[blurkeys[idx]]" min="0" max="1" step="0.01" @input="e => setParam(e, blurkeys[idx])" @dblclick="e => resetParamCtrl(e, blurkeys[idx])">
      <input :id="'blur_' + blurkeys[idx] + '_'" type="number" class="rangenumb" :value="params.blur[blurkeys[idx]]" min="0" max="1" step="0.01" @input="e => setParam(e, blurkeys[idx])">
    </div>
  </Section>
</template>

<script setup>
import { ref, inject } from 'vue'
import { debounce } from '../js/tools.js'
import Section from './Section.vue'

const sel = inject('sel')

const props = defineProps({
  params: { type: Object, required: true },
  onUpdate: { type: Function, default: null },
})

const showmouse = ref(false)
const blurkeys = ['bokehstrength', 'gaussianstrength', 'bokehlensout']
const blurlabels = ['散景强度', '高斯强度', '圆形半径']

const paramszero = { bokehstrength: 0, bokehlensout: 0.5, gaussianstrength: 0, centerX: 0.5, centerY: 0.5 }
const checkParamsZero = blurkeys.every(k => (props.params.blur[k] ?? 0) === (paramszero[k] ?? 0))

function setParam(e, key) {
  const val = parseFloat(e.target.value)
  debounce('blur_' + key, () => {
    props.params.blur[key] = val
    props.onUpdate?.()
  }, 30)
}

function resetParamCtrl(e, key) {
  props.params.blur[key] = 0
  props.onUpdate?.()
}

function resetSection(sec) {
  blurkeys.forEach(k => { props.params.blur[k] = paramszero[k] })
  showmouse.value = false
  showmouse.value = [[props.params.blur.centerX, props.params.blur.centerY]]
  props.onUpdate?.()
}
</script>
