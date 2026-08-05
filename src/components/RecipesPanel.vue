<template>
  <Section
    sectionname="recipes"
    :height="145"
    :params="params"
  >
    <div>
      <button @click="loadRecipe">载入</button>
      <button @click="saveRecipe" :disabled="!hasRecipe">保存</button>
    </div>
    <div><small>将保存: <i>亮度, 颜色, 效果, 曲线, 滤镜和模糊</i></small></div>
  </Section>
</template>

<script setup>
import { ref, inject } from 'vue'
import Section from './Section.vue'
import { openFile, downloadFile } from '../js/tools.js'

const sel = inject('sel')

const props = defineProps({
  params: { type: Object, required: true },
  onUpdate: { type: Function, required: true },
})

const hasRecipe = ref(false)

function buildRecipe() {
  const recipe = {}
  const list = ['colors', 'curve', 'lights', 'effects']
  list.forEach(e => {
    const x = Object.keys(props.params[e]).reduce((p, v) => {
      if (props.params[e][v]) p[v] = props.params[e][v]
      return p
    }, {})
    if (Object.keys(x).length) recipe[e] = x
  })
  if (props.params.blur.bokehstrength || props.params.blur.gaussianstrength) {
    recipe.blur = { ...props.params.blur }
  }
  if (props.params.filters?.opt?.label) {
    recipe.filters = props.params.filters.opt.label
  }
  return recipe
}

function saveRecipe() {
  const recipe = buildRecipe()
  if (!Object.keys(recipe).length) return
  const newfilename = 'recipe_' + new Date().toISOString().split('T')[0] + '.json'
  const bytes = new TextEncoder().encode(JSON.stringify(recipe))
  const blob = new Blob([bytes], { type: 'application/json;charset=utf-8' })
  downloadFile(blob, newfilename)
}

async function loadRecipe() {
  const f = await openFile('application/json')
  if (!f) return
  const reader = new FileReader()
  await new Promise(r => { reader.onload = r; reader.readAsText(f) })
  const json = JSON.parse(reader.result)
  ;['colors', 'curve', 'lights', 'effects', 'blur'].forEach(e => {
    if (json[e]) props.params[e] = { ...props.params[e], ...json[e] }
  })
  if (json.filters) props.params.filters.label = json.filters
  sel.value = null
  props.onUpdate()
}
</script>
