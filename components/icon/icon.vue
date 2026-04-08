<template>
  <view class="icon-wrap" :style="{ width: sizeValue + 'rpx', height: sizeValue + 'rpx' }">
    <text class="icon-text" :style="{ color: color, fontSize: sizeValue + 'rpx' }">{{ iconChar }}</text>
  </view>
</template>

<script>
// 使用Unicode字符映射，小程序完全兼容
const ICON_CHARS = {
  'class': '📚',
  'run': '🏃',
  'package': '📦',
  'exam': '📝',
  'location': '📍',
  'time': '⏰',
  'wallet': '💰',
  'settings': '⚙️',
  'help': '❓',
  'chat': '💬',
  'bell': '🔔',
  'user': '👤',
  'school': '🏫',
  'search': '🔍',
  'home': '🏠',
  'order': '📋',
  'add': '➕',
  'arrow-right': '➡️',
  'arrow-left': '⬅️',
  'chevron-down': '⬇️',
  'more': '⋯',
  'share': '📤',
  'refresh': '🔄',
  'chart': '📊',
  'users': '👥',
  'copy': '📋',
  'star': '⭐',
  'pause': '⏸',
  'play': '▶️',
  'edit': '✏️',
  'trash': '🗑️',
  'phone': '📱',
  'camera': '📷',
  'file': '📄',
  'download': '⬇️',
  'upload': '⬆️',
  'calendar': '📅',
  'gift': '🎁',
  'check': '✅',
  'check-circle': '✔️',
  'close': '❌',
  'warning': '⚠️',
  'info': 'ℹ️',
  'waiting': '⏳',
  'grid': '▦',
  'briefcase': '💼',
  'book': '📖',
  'minus': '➖',
  'shield': '🛡️',
  'default': '●'
};

export default {
  name: 'Icon',
  props: {
    name: { type: String, required: true },
    size: { type: [Number, String], default: 48 },
    color: { type: String, default: '#333333' }
  },
  computed: {
    sizeValue() {
      return Number(this.size);
    },
    iconChar() {
      return ICON_CHARS[this.name] || ICON_CHARS['default'];
    }
  }
};
</script>

<style scoped>
.icon-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  line-height: 1;
}

.icon-text {
  display: inline-block;
  line-height: 1;
  font-size: inherit;
  color: inherit;
  text-align: center;
}
</style>
