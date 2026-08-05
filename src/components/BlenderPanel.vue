<template>
  <Section
    sectionname="blender"
    :height="115"
    :params="params"
    :onEnable="() => onUpdate?.()"
    :onReset="() => resetBlender()"
    :resetDisabled="!params?.blender?.blendmap"
  >
    <template v-if="!blendname">
      <ClickDropFile
        text="点击或拖放混合图片"
        accept="image/*"
        @file="onBlend"
        style="width:90%;height:50px;"
      />
    </template>
    <template v-else>
      <input type="text" :value="blendname" disabled style="width:90%;margin-bottom:10px;padding-right:20px;">
      <div style="display:flex;justify-content:flex-start;align-items:center;gap:4px;">
        <div class="rangelabel">混合比例</div>
        <input id="blender_blendmix" style="width:130px;" type="range" :value="params.blender.blendmix" min="0" max="1" step="0.01" @input="setBlendMix">
        <input id="blender_blendmix_" type="number" class="rangenumb" step="0.01" min="0" max="1" :value="params.blender.blendmix" @input="setBlendMix">
      </div>
    </template>
  </Section>
</template>

<script setup>
import { ref, inject } from 'vue'
import Section from './Section.vue'
import ClickDropFile from './ClickDropFile.vue'
import { debounce, readImage } from '../js/tools.js'

const sel = inject('sel')

const props = defineProps({
  params: { type: Object, required: true },
  onUpdate: { type: Function, required: true },
})

const blendname = ref('')

function onBlend(file) {
  readImage(file, (_arr, info, img) => {
    if (!img) return
    img.filename = info?.name
    props.params.blender.blendmap = img
    blendname.value = info?.name
    props.params.blender.blendmix = 0.5
    props.onUpdate()
  })
}

function setBlendMix(e) {
  const val = parseFloat(e.target.value)
  debounce('blender', () => {
    props.params.blender.blendmix = val
    props.onUpdate()
  }, 30)
}

function resetBlender() {
  if (props.params.blender?.$skip) return
  props.params.blender.blendmap = 0
  props.params.blender.blendmix = 0.5
  blendname.value = ''
  props.onUpdate()
}
</script>
