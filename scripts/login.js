function setLoginEnabled(enabled) {
  const loginButton = document.getElementById('loginSubmitButton');
  if (!loginButton) return;
  loginButton.disabled = !enabled;
  loginButton.classList.toggle('opacity-50', !enabled);
  loginButton.classList.toggle('cursor-not-allowed', !enabled);
}

function showLoginError(message) {
  const errorBox = document.getElementById('loginError') || document.getElementById('formLoginError');
  if (errorBox) {
    errorBox.textContent = message;
    errorBox.classList.remove('hidden');
  } else {
    alert(message);
  }
}

function hideLoginError() {
  const errorBox = document.getElementById('loginError') || document.getElementById('formLoginError');
  if (errorBox) {
    errorBox.textContent = '';
    errorBox.classList.add('hidden');
  }
}

async function isBackendAvailable() {
  const base = (window.location.protocol.startsWith('http') && window.location.port !== '8000')
    ? window.location.origin
    : 'http://127.0.0.1:3000';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const response = await fetch(`${base}/api/health`, { 
      method: 'GET', 
      cache: 'no-store',
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
}

async function checkBackendConnection() {
  const statusBox = document.getElementById('serverStatusMessage');
  setLoginEnabled(true);

  const online = await isBackendAvailable();

  if (!statusBox) return;

  if (online) {
    statusBox.classList.add('hidden');
    return;
  }

  statusBox.classList.add('hidden');
  statusBox.innerHTML = '';
}

function redirectAfterLogin(role) {
  const url = role === 'staff' ? 'staff-dashboard.html' : 'dashboard.html';
  setTimeout(() => {
    window.location.href = url;
  }, 100);
}

function loginWithDemoAccount(username, password, selectedRole) {
  const result = validateDemoCredentials(username, password, selectedRole);
  if (!result.ok) {
    showLoginError(result.error);
    return false;
  }

  const { account } = result;
  setAuthData('demo-token-' + Date.now(), account.role, account.fullName);
  redirectAfterLogin(account.role);
  return false;
}

async function handleLogin(event) {
  event.preventDefault();
  hideLoginError();

  const usernameInput = document.getElementById('username') || document.getElementById('modal-username');
  const passwordInput = document.getElementById('password') || document.getElementById('modal-password');
  const submitButton = document.getElementById('loginSubmitButton');

  const username = usernameInput?.value.trim() || '';
  const password = passwordInput?.value || '';
  const selectedRole = document.getElementById('loginRole')?.value || '';

  if (!username || !password) {
    showLoginError('Please enter your username and password.');
    return false;
  }

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = 'Signing in...';
  }

  try {
    const backendUp = await isBackendAvailable();

    if (!backendUp) {
      loginWithDemoAccount(username, password, selectedRole);
      return false;
    }

    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const text = await response.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      throw new Error('Invalid server response. Please try again.');
    }

    if (!response.ok) {
      throw new Error((data && data.error) || 'Invalid username or password.');
    }

    if (selectedRole && data.role !== selectedRole) {
      const expected = data.role === 'admin' ? 'Admin Dashboard' : 'Staff Dashboard';
      throw new Error(`Wrong login type. Select "${expected}" for this account.`);
    }

    setAuthData(data.token, data.role, data.fullName);
    redirectAfterLogin(data.role);
  } catch (error) {
    const isNetworkError = /failed to fetch|networkerror|network request failed/i.test(
      error.message || ''
    );

    if (isNetworkError) {
      loginWithDemoAccount(username, password, selectedRole);
    } else {
      showLoginError(error.message || 'Login failed.');
    }
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = 'Sign In';
    }
  }

  return false;
}

window.handleLogin = handleLogin;
window.checkBackendConnection = checkBackendConnection;
