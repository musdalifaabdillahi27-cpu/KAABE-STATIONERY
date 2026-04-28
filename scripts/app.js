function toggleMobileMenu(id) {
  const menu = document.getElementById(id);
  if (!menu) return;
  menu.classList.toggle('hidden');
}

function openModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.remove('hidden');
}

function toggleModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.toggle('hidden');
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.add('hidden');
}

function openLoginModal() {
  const modal = document.getElementById('loginModal');
  const errorBox = document.getElementById('loginError');
  const usernameInput = document.getElementById('modal-username');
  if (modal) modal.classList.remove('hidden');
  if (errorBox) errorBox.classList.add('hidden');
  if (usernameInput) usernameInput.focus();
}

function openLoginModalOnError() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('error') === '1') {
    const modal = document.getElementById('loginModal');
    const errorBox = document.getElementById('loginError');
    if (modal) modal.classList.remove('hidden');
    if (errorBox) errorBox.classList.remove('hidden');
  }
}

function validateLandingLogin(event) {
  event.preventDefault();
  const username = document.getElementById('modal-username').value.trim();
  const password = document.getElementById('modal-password').value.trim();
  const errorBox = document.getElementById('loginError');

  const validUsers = {
    admin: 'admin123',
    staff1: 'staff123',
    customer1: 'cust123'
  };

  if (validUsers[username] && validUsers[username] === password) {
    window.location.href = 'dashboard.html';
    return false;
  }

  if (errorBox) {
    errorBox.classList.remove('hidden');
  }
  return false;
}

window.toggleMobileMenu = toggleMobileMenu;
window.toggleModal = toggleModal;
window.closeModal = closeModal;
window.openLoginModal = openLoginModal;
window.openLoginModalOnError = openLoginModalOnError;
window.validateLandingLogin = validateLandingLogin;

if (document.readyState !== 'loading') {
  openLoginModalOnError();
} else {
  document.addEventListener('DOMContentLoaded', openLoginModalOnError);
}
