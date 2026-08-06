<template>
  <Section
    sectionname="heal"
    :height="85"
    :params="params"
    :onReset="() => resetSection('heal')"
    :resetDisabled="!params?.heal?.healmask"
  >
    <div style="text-align:left;color:grey;">
      <label style="width:80px;display:inline-block;">{{ switchlabel }} mask:</label>
      <label class="switch" style="transform:scale(0.7);">
        <input type="checkbox" checked @change="handleSwitch">
        <span class="slider round"></span>
      </label>
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

const switchlabel = ref('隐藏')

function handleSwitch(e) {
  if (e.target.checked) {
    switchlabel.value = '隐藏'
  } else {
    switchlabel.value = '显示'
  }
}

function resetSection(sec) {
  props.params.heal.healmask = null
  props.onUpdate()
}
</script>

<style scoped>
.switch { position: relative; display: inline-block; width: 60px; height: 34px; }
.switch input { opacity: 0; width: 0; height: 0; }
.slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; }
.slider:before { position: absolute; content: ""; height: 26px; width: 26px; left: 4px; bottom: 4px; background-color: white; transition: .4s; }
input:checked + .slider { background-color: var(--accent-strong); }
input:checked + .slider:before { transform: translateX(26px); }
.slider.round { border-radius: 34px; }
.slider.round:before { border-radius: 50%; }
</style>
