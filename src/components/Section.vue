<template>
  <div class="section" :id="sectionname" :selected="sel === sectionname || undefined"
    :style="sel === sectionname && height > 0 ? { height: height + 'px' } : {}"
    @click.stop="onClick">
    <div class="section_header">
      <a v-if="!!onEnable" :id="'btn_skip_' + sectionname" class="section_skip" @click.stop="handleSkipSection"
        title="启用/禁用">&#9737;</a>
      <b class="section_label">{{ sectionLabels[sectionname] || sectionname }}</b>
      <a v-if="!!onReset" :id="'btn_reset_' + sectionname" class="reset_btn" :disabled="resetDisabled"
        @click.stop="resetSection" title="重置">&Oslash;</a>
    </div>

    <div v-if="sel === sectionname" :id="sectionname + '_content'" class="section_content" :class="{ skip: skipped }"
      @click.stop>
      <div class="section_scroll">
        <hr>
        <button class="close_btn" @click.stop="sel = ''">X</button>
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, inject } from 'vue'

// 区块标题中文映射
const sectionLabels = {
  composition: '构图',
  lights: '光影',
  colors: '色彩',
  effects: '效果',
  curve: '曲线',
  filters: '滤镜',
  blender: '混合',
  blur: '模糊',
  recipes: '配方',
  heal: '修复',
}

const sel = inject('sel')

const props = defineProps({
  sectionname: { type: String, required: true },
  height: { type: Number, default: 100 },
  params: { type: Object, default: () => ({}) },
  onEnable: { type: Function, default: null },
  onReset: { type: Function, default: null },
  resetDisabled: { type: Boolean, default: true }
})

const skipped = computed(() => {
  return !!props.params?.[props.sectionname]?.$skip
})

function onClick(e) {
  sel.value = props.sectionname
}

function handleSkipSection(e) {
  if (!props.params?.[props.sectionname]) return
  const sec = props.params[props.sectionname]
  sec.$skip = !sec.$skip
  if (props.onEnable) props.onEnable(!sec.$skip)
}

function resetSection() {
  if (props.params?.[props.sectionname]?.$skip) return
  if (props.onReset) props.onReset(props.sectionname)
}
</script>

<style scoped>
.section {
  background-color: light-dark(#e0e0e0, #222222);
  border-radius: 15px;
  padding: 10px;
  margin: 2px 0;
  font-size: 14px;
  height: 23px;
  transition: height .3s;
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  position: relative;
  cursor: pointer;
}

.section:hover {
  background-color: light-dark(#ededed, #292929);
}

.section[selected] {
  background-color: light-dark(#d4d4d4, #292929);
  overflow: visible;
  height: auto;
}

.section[selected] .section_label {
  color: darkorange;
}

.section_header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section_skip {
  width: 20px;
  color: darkorange;
  cursor: cell;
}

.section_label {
  flex: 1;
  text-align: left;
  color: gray;
}

.reset_btn {
  font-weight: bold;
  margin-left: 5px;
}

.reset_btn[disabled] {
  font-weight: normal;
}

.section_content {
  flex: 1;
  overflow: hidden;
}

.section_scroll {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
  overflow-x: hidden;
  min-width: 0;
}
.section_scroll :deep(> div) {
  flex-shrink: 0;
}

.close_btn {
  position: absolute;
  top: 7px;
  right: 25px;
  width: 40px;
  height: 20px;
  padding: 0;
  background: darkorange;
  display: none;
}

.section_content.skip {
  opacity: 0.2;
  pointer-events: none;
}
</style>
