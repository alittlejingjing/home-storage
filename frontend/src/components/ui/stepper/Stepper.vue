<template>
  <nav class="stepper" aria-label="步骤">
    <ol class="stepper-list">
      <li
        v-for="(step, index) in steps"
        :key="index"
        class="stepper-item"
        :class="{
          'stepper-item--active': index === currentStep,
          'stepper-item--done': index < currentStep,
        }"
      >
        <span class="stepper-indicator">
          <span v-if="index < currentStep" class="stepper-check">✓</span>
          <span v-else class="stepper-num">{{ index + 1 }}</span>
        </span>
        <span class="stepper-label">{{ stepLabel(step) }}</span>
        <span v-if="index < steps.length - 1" class="stepper-line" aria-hidden="true" />
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
interface Props {
  /** 步骤列表，每项为字符串或 { label: string } */
  steps: (string | { label: string })[]
  /** 当前步骤索引（从 0 开始） */
  currentStep?: number
}

withDefaults(defineProps<Props>(), {
  currentStep: 0,
})

function stepLabel(step: string | { label: string }): string {
  return typeof step === 'string' ? step : step.label
}
</script>

<style scoped>
.stepper {
  width: 100%;
}
.stepper-list {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  align-items: flex-start;
  gap: 0;
}
.stepper-item {
  display: flex;
  align-items: center;
  flex: 0 0 auto;
  position: relative;
}
.stepper-indicator {
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 9999px;
  border: 2px solid var(--border);
  background: var(--background);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--muted-foreground);
  flex-shrink: 0;
}
.stepper-item--active .stepper-indicator {
  border-color: var(--primary);
  background: var(--primary);
  color: var(--primary-foreground);
}
.stepper-item--done .stepper-indicator {
  border-color: var(--primary);
  background: var(--primary);
  color: var(--primary-foreground);
}
.stepper-check {
  font-size: 0.7rem;
}
.stepper-num {
  line-height: 1;
}
.stepper-label {
  margin-left: 0.5rem;
  font-size: 0.875rem;
  color: var(--muted-foreground);
  white-space: nowrap;
}
.stepper-item--active .stepper-label {
  color: var(--foreground);
  font-weight: 500;
}
.stepper-item--done .stepper-label {
  color: var(--foreground);
}
.stepper-line {
  width: 2rem;
  height: 2px;
  margin: 0 0.5rem;
  background: var(--border);
  flex-shrink: 0;
}
.stepper-item--done + .stepper-item .stepper-line,
.stepper-item--done .stepper-line {
  background: var(--primary);
}
</style>
