<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
	/*设计系统 CSS 变量 */
	:root {
		/* 颜色变量 - 主色调 */
		--color-primary: #1565C0;
		--color-primary-dark: #1155AA;
		--color-primary-light: #E3F2FD;
		
		/* 功能色 */
		--color-success: #4CAF50;
		--color-warning: #FF9800;
		--color-error: #EF4444;
		--color-info: #2196F3;
		
		/* 中性色 */
		--color-surface: #F4F5F7;
		--color-surface-variant: #F8FAFC;
		--color-border: #EBEBEB;
		--color-divider: #E5E7EB;
		
		/* 文本颜色 */
		--color-text-1: #111827;
		--color-text-2: #6B7280;
		--color-text-3: #9CA3AF;
		
		/* 圆角变量 */
		--radius-xs: 8rpx;
		--radius-sm: 12rpx;
		--radius-md: 16rpx;
		--radius-lg: 24rpx;
		--radius-xl: 32rpx;
		--radius-full: 50%;
		
		/* 阴影变量 */
		--shadow-sm: 0 1rpx 2rpx rgba(0,0,0,0.05);
		--shadow-card: 0 2rpx 12rpx rgba(0,0,0,0.06);
		--shadow-md: 0 4rpx 24rpx rgba(0,0,0,0.1);
		--shadow-lg: 0 8rpx 32rpx rgba(0,0,0,0.15);
		
		/* 字体大小 */
		--font-xs: 20rpx;
		--font-sm: 22rpx;
		--font-md: 24rpx;
		--font-lg: 28rpx;
		--font-xl: 32rpx;
		--font-2xl: 36rpx;
		
		/* 间距 */
		--spacing-xs: 8rpx;
		--spacing-sm: 12rpx;
		--spacing-md: 16rpx;
		--spacing-lg: 24rpx;
		--spacing-xl: 32rpx;
		--spacing-2xl: 48rpx;
		
		/* 动画 */
		--transition-fast: 0.15s ease;
		--transition-normal: 0.2s ease;
		--transition-slow: 0.3s ease;
	}

	/*每个页面公共css */
	.page-container {
		/* 固定顶部间距，适配小程序导航栏 */
		padding-top: 0;
		min-height: 100vh;
		box-sizing: border-box;
		background-color: var(--color-surface);
	}
</style>
