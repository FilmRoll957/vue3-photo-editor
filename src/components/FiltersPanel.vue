<template>
  <Section
    sectionname="filters"
    :height="0"
    :params="params"
    :onEnable="() => onUpdate?.()"
    :onReset="() => resetFilters()"
    :resetDisabled="!selectedIdx"
  >
    <div class="filter_grid">
      <button
        v-for="(f, idx) in filtersLUT"
        :key="f.label"
        class="btn_insta"
        :selected="selectedIdx === idx || undefined"
        @click="selectFilter(idx)"
      >{{ filterLabels[f.label] || f.label }}</button>
    </div>
  </Section>
</template>

<script setup>
import { ref, inject } from 'vue'
import Section from './Section.vue'

const sel = inject('sel')

const props = defineProps({
  params: { type: Object, required: true },
  onUpdate: { type: Function, required: true },
})

const selectedIdx = ref(false)

const filterLabels = {
  aden: '阿登',
  crema: '奶油',
  clarendon: '克拉伦登',
  gingham: '方格',
  juno: '朱诺',
  lark: '云雀',
  ludwig: '路德维格',
  moon: '月光',
  reyes: '雷耶斯',
  polaroid: '宝丽来',
  kodak: '柯达',
  browni: '布朗尼',
  vintage: '复古',
}

const filtersLUT = [
  { type: '1', label: 'aden', map1: async () => import('../assets/LUT/LUT_aden.png') },
  { type: '1', label: 'crema', map1: async () => import('../assets/LUT/LUT_crema.png') },
  { type: '2', label: 'clarendon', map1: async () => import('../assets/LUT/LUT_clarendon1.png'), map2: async () => import('../assets/LUT/LUT_clarendon2.png') },
  { type: '3', label: 'gingham', map1: async () => import('../assets/LUT/LUT_gingham1.png'), map2: async () => import('../assets/LUT/LUT_gingham_lgg.png') },
  { type: '1', label: 'juno', map1: async () => import('../assets/LUT/LUT_juno.png') },
  { type: '1', label: 'lark', map1: async () => import('../assets/LUT/LUT_lark.png') },
  { type: '1', label: 'ludwig', map1: async () => import('../assets/LUT/LUT_ludwig.png') },
  { type: '4', label: 'moon', map1: async () => import('../assets/LUT/LUT_moon1.png'), map2: async () => import('../assets/LUT/LUT_moon2.png') },
  { type: '1', label: 'reyes', map1: async () => import('../assets/LUT/LUT_reyes.png') },
  { type: 'MTX', label: 'polaroid', mtx: 'polaroid' },
  { type: 'MTX', label: 'kodak', mtx: 'kodachrome' },
  { type: 'MTX', label: 'browni', mtx: 'browni' },
  { type: 'MTX', label: 'vintage', mtx: 'vintage' },
]

async function loadFilterLUT(url) {
  const img = new Image()
  img.src = url
  await img.decode()
  return img
}

async function setFilter(idx) {
  const _f = filtersLUT[parseInt(idx)]
  if (_f.map1 && typeof _f.map1 === 'function') _f.map1 = await loadFilterLUT((await _f.map1()).default)
  if (_f.map2 && typeof _f.map2 === 'function') _f.map2 = await loadFilterLUT((await _f.map2()).default)
  const { type, mtx, map1, map2, label } = _f
  props.params.filters.opt = { type, mtx, map1, map2, label }
}

async function selectFilter(idx) {
  if (selectedIdx.value !== idx) {
    selectedIdx.value = idx
    props.params.filters.$skip = false
    await setFilter(idx)
    props.onUpdate()
  } else {
    resetFilters()
  }
}

function resetFilters() {
  selectedIdx.value = false
  props.params.filters.opt = 0
  props.onUpdate()
}
</script>

<style>
.filter_grid{
  display:flex;
  flex-wrap:wrap;
  width:100%;
  min-width:0;
  gap:3px;
}
.btn_insta{
  color: light-dark(#3a4a62, rgba(255,255,255,0.8));
  font-size:11px;
  padding:5px 4px;
  margin:0;
  flex: 1 1 0;
  min-width: calc((100% - 9px) / 4);
  max-width: calc((100% - 9px) / 4);
  box-sizing:border-box;
  border:1px solid light-dark(rgba(30,50,90,0.12), rgba(120,160,220,0.15));
  background: light-dark(rgba(255,255,255,0.4), rgba(255,255,255,0.06));
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  border-radius:8px;
  cursor:pointer;
  line-height:1.3;
  word-break:keep-all;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
  transition: all 0.2s ease;
}
.btn_insta:hover{
  background: var(--accent-soft);
  border-color: var(--accent-hover);
  transform: translateY(-1px);
}
.btn_insta[selected]{
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-soft);
  box-shadow: 0 2px 8px var(--accent-soft);
}
</style>
