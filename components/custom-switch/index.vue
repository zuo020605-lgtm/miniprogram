<template>
  <view class="custom-switch" :class="{ 'custom-switch--checked': checked }" @click="toggle">
    <view class="custom-switch__track"></view>
    <view class="custom-switch__thumb"></view>
  </view>
</template>

<script>
export default {
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    checked() {
      return this.value;
    }
  },
  methods: {
    toggle() {
      const newValue = !this.checked;
      this.$emit('input', newValue);
      this.$emit('change', { detail: { value: newValue } });
    }
  }
};
</script>

<style scoped>
.custom-switch {
  position: relative;
  width: 44px;
  height: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.custom-switch__track {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #e5e8ec;
  border-radius: 12px;
  transition: background-color 0.3s ease;
}

.custom-switch__thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background-color: #ffffff;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.custom-switch--checked .custom-switch__track {
  background-color: #3498db;
}

.custom-switch--checked .custom-switch__thumb {
  transform: translateX(20px);
}
</style>