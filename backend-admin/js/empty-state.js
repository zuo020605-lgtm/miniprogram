/**
 * 空状态组件
 * 用于统一显示无数据、加载失败等状态
 */

const EmptyState = {
  /**
   * 渲染空状态
   * @param {string} containerId - 容器 ID
   * @param {Object} options - 配置选项
   */
  render(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error('容器不存在:', containerId);
      return;
    }

    const {
      type = 'empty', // empty, loading, error
      icon = '📭',
      title = '暂无数据',
      description = '当前没有相关数据',
      actions = []
    } = options;

    let html = '';

    if (type === 'empty') {
      html = this.renderEmpty(icon, title, description, actions);
    } else if (type === 'loading') {
      html = this.renderLoading(title);
    } else if (type === 'error') {
      html = this.renderError(icon, title, description, actions);
    }

    container.innerHTML = html;
  },

  /**
   * 渲染空状态
   */
  renderEmpty(icon, title, description, actions) {
    const actionsHtml = actions.length > 0 
      ? `<div class="empty-state-actions">
           ${actions.map(action => 
             `<button class="btn ${action.class || 'btn-primary'}" 
                      onclick="${action.onclick}">
               ${action.text}
             </button>`
           ).join('')}
         </div>`
      : '';

    return `
      <div class="empty-state">
        <div class="empty-state-icon">${icon}</div>
        <div class="empty-state-title">${title}</div>
        ${description ? `<div class="empty-state-description">${description}</div>` : ''}
        ${actionsHtml}
      </div>
    `;
  },

  /**
   * 渲染加载状态
   */
  renderLoading(text = '加载中...') {
    return `
      <div class="loading-state">
        <div class="spinner"></div>
        <div class="loading-state-text">${text}</div>
      </div>
    `;
  },

  /**
   * 渲染错误状态
   */
  renderError(icon, title, description, actions) {
    const actionsHtml = actions.length > 0 
      ? `<div class="error-state-actions">
           ${actions.map(action => 
             `<button class="btn ${action.class || 'btn-primary'}" 
                      onclick="${action.onclick}">
               ${action.text}
             </button>`
           ).join('')}
         </div>`
      : '';

    return `
      <div class="error-state">
        <div class="error-state-icon">${icon}</div>
        <div class="error-state-title">${title}</div>
        ${description ? `<div class="error-state-message">${description}</div>` : ''}
        ${actionsHtml}
      </div>
    `;
  },

  /**
   * 表格空状态
   */
  renderTableEmpty(colspan, icon, title, description) {
    return `
      <tr>
        <td colspan="${colspan || 10}">
          <div class="table-empty-state">
            <div style="font-size: 48px; margin-bottom: 10px;">${icon}</div>
            <div style="font-size: 16px; color: #666;">${title}</div>
            ${description ? `<div style="font-size: 14px; color: #999; margin-top: 8px;">${description}</div>` : ''}
          </div>
        </td>
      </tr>
    `;
  },

  /**
   * 显示数据或空状态
   * @param {Array} data - 数据数组
   * @param {string} containerId - 容器 ID
   * @param {Function} renderFn - 渲染数据的函数
   * @param {Object} emptyOptions - 空状态配置
   */
  showDataOrEmpty(data, containerId, renderFn, emptyOptions = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!data || data.length === 0) {
      this.render(containerId, {
        type: 'empty',
        icon: emptyOptions.icon || '📭',
        title: emptyOptions.title || '暂无数据',
        description: emptyOptions.description || '当前没有相关数据',
        actions: emptyOptions.actions || []
      });
    } else {
      container.innerHTML = renderFn(data);
    }
  }
};

// 导出（如果在模块环境中）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EmptyState;
}
