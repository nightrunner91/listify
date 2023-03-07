<script lang="ts" setup>
export interface Props {
  type?: 'accented' | 'filled' | 'muted' | 'outlined' | 'link',
  color?: 'primary' | 'secondary' | 'suppliment',
  size?: 'small' | 'medium' | 'large',
}

const props = withDefaults(defineProps<Props>(), {
  type: 'filled',
  color: 'primary',
  size: 'medium',
})
</script>

<template>
  <button
    class="ly-button"
    :class="[
      `ly-button--${props.type}`,
      `ly-button--${props.color}`,
      `ly-button--${props.size}`,
    ]">
    <slot />
  </button>
</template>

<style lang="scss" scoped>
.ly-button {
  white-space: nowrap;
  outline: none;
  position: relative;
  z-index: auto;
  border: none;
  display: inline-flex;
  flex-wrap: nowrap;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  user-select: none;
  text-align: center;
  cursor: pointer;
  text-decoration: none;
  outline: 0;
  border-radius: radius('base');

  // types
  &--accented {
    color: var(--clr-button);
  }

  // colors
  &--primary {
    background-color: var(--clr-primary);
  }

  // sizes
  &--small {
    padding: spacer(2, 4);
  }

  &--medium {
    padding: spacer(3, 6);
  }

  &--large {
    padding: spacer(4, 8);
  }
}
</style>
