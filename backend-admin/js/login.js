/**
 * 登录页面逻辑
 */

// 切换密码显示/隐藏
function togglePassword() {
  const passwordInput = document.getElementById('password');
  const toggleBtn = document.querySelector('.password-toggle');
  
  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    toggleBtn.textContent = '🙈';
  } else {
    passwordInput.type = 'password';
    toggleBtn.textContent = '👁️';
  }
}

// 处理登录
async function handleLogin(event) {
  event.preventDefault();
  
  // 获取表单数据
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const rememberMe = document.getElementById('rememberMe').checked;
  
  // 验证输入
  if (!username || !password) {
    showError('请输入用户名和密码');
    return;
  }
  
  if (password.length < 6) {
    showError('密码长度不能少于 6 位');
    return;
  }
  
  // 显示加载状态
  setLoading(true);
  hideError();
  
  try {
    // 调用登录 API
    const result = await AuthService.login(username, password, rememberMe);
    
    if (result.success) {
      if (!AuthService.isLoggedIn()) {
        throw new Error('登录状态保存失败，请检查浏览器是否允许本地存储');
      }

      // 登录成功
      showSuccess('登录成功，正在跳转...');
      
      // 延迟跳转，让用户看到成功提示
      setTimeout(() => {
        AuthService.getRedirectUrl();
        window.location.replace('index.html');
      }, 1000);
    } else {
      // 登录失败
      showError(result.message || '登录失败，请重试');
      setLoading(false);
    }
  } catch (error) {
    console.error('登录异常:', error);
    showError('网络错误，请检查网络连接');
    setLoading(false);
  }
}

// 显示错误信息
function showError(message) {
  const errorDiv = document.getElementById('errorMessage');
  const errorText = document.getElementById('errorText');
  
  errorText.textContent = message;
  errorDiv.style.display = 'flex';
  
  // 3 秒后自动隐藏
  setTimeout(() => {
    errorDiv.style.display = 'none';
  }, 5000);
}

// 隐藏错误信息
function hideError() {
  const errorDiv = document.getElementById('errorMessage');
  errorDiv.style.display = 'none';
}

// 显示成功信息
function showSuccess(message) {
  // 可以添加成功提示动画
  console.log('成功:', message);
}

// 设置加载状态
function setLoading(loading) {
  const loginBtn = document.getElementById('loginBtn');
  const btnText = loginBtn.querySelector('.btn-text');
  const btnLoading = loginBtn.querySelector('.btn-loading');
  
  if (loading) {
    loginBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoading.style.display = 'flex';
  } else {
    loginBtn.disabled = false;
    btnText.style.display = 'flex';
    btnLoading.style.display = 'none';
  }
}

// 页面加载完成
document.addEventListener('DOMContentLoaded', function() {
  // 聚焦到用户名输入框
  document.getElementById('username').focus();
  
  // 监听回车键登录
  document.getElementById('password').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      handleLogin(e);
    }
  });
  
  // 清除错误信息当用户开始输入时
  document.getElementById('username').addEventListener('input', hideError);
  document.getElementById('password').addEventListener('input', hideError);
});
