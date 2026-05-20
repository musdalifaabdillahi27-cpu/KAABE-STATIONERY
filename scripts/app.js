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



window.toggleMobileMenu = toggleMobileMenu;
window.toggleModal = toggleModal;
window.closeModal = closeModal;
window.openLoginModal = openLoginModal;
window.openLoginModalOnError = openLoginModalOnError;

function handleSidebarRoles() {
  const role = (localStorage.getItem('kaabeRole') || '').toLowerCase().trim();
  const isAdmin = role === 'admin';
  const isStaff = role === 'staff';

  const applyHiding = () => {
    const role = (localStorage.getItem('kaabeRole') || '').toLowerCase().trim();
    if (role !== 'staff') return;

    // Remove staff-restricted sidebar links (never hide via CSS — keeps admin nav stable)
    document
      .querySelectorAll(
        'aside a[href="staff-management.html"], #mobile-menu a[href="staff-management.html"]'
      )
      .forEach((el) => el.remove());

    // Hide admin-only controls in main content
    document.querySelectorAll('main [data-role="admin-only"]').forEach((el) => el.remove());

    // Update role labels
    const roleLabels = document.querySelectorAll('p, span, div');
    roleLabels.forEach(label => {
      if (label.classList.contains('text-white/80') || label.classList.contains('text-slate-500')) {
        if (label.textContent.includes('Admin') || label.textContent.includes('Store Owner')) {
          label.textContent = 'Staff Access';
        }
      }
    });
    
    // Update the name if available
    const fullName = localStorage.getItem('kaabeName');
    if (fullName) {
      const nameElements = document.querySelectorAll('p.font-semibold');
      nameElements.forEach(el => {
        if (el.textContent === 'Alex Rivera') {
          el.textContent = fullName;
          // Update initials
          const initials = fullName.split(' ').map(n => n[0]).join('').toUpperCase();
          const avatar = el.parentElement.previousElementSibling;
          if (avatar && avatar.classList.contains('rounded-2xl')) {
            avatar.textContent = initials.substring(0, 2);
          }
        }
      });
    }
  };

  const updateBrandAndLabels = (isAdmin) => {
    // Admin dashboard link on shared pages (e.g. debts.html)
    const dashboardLinks = document.querySelectorAll(
      'aside a[href="staff-dashboard.html"], #mobile-menu a[href="staff-dashboard.html"]'
    );
    dashboardLinks.forEach((link) => {
      link.href = isAdmin ? 'dashboard.html' : 'staff-dashboard.html';
    });

    // Update Brand Name
    const brandNames = document.querySelectorAll('p.tracking-\\[0\\.2em\\], .text-lg.font-semibold');
    brandNames.forEach(el => {
      const text = el.textContent.toLowerCase();
      if (text.includes('kaabe statio') || text.includes('stationery pro')) {
        el.textContent = isAdmin ? 'STATIONERY PRO' : 'KAABE STATIO';
      }
    });

    // Update Product & Debt Link Labels
    const allLinks = document.querySelectorAll('aside nav a, #mobile-menu nav a');
    allLinks.forEach(link => {
      const span = link.querySelector('span.font-medium') || link;
      const text = span.textContent.trim().toLowerCase();
      
      // Handle Product Link
      if ((text === 'sell product' || text === 'products')) {
        if (isAdmin) {
          span.textContent = 'Products';
        } else {
          span.textContent = 'Sell Product';
        }
      }

      // Handle Debt Link
      if (text === 'debt information' || text === 'debt management') {
        span.textContent = isAdmin ? 'Debt Information' : 'Debt Management';
      }
    });

    // Update Role Labels
    const roleLabels = document.querySelectorAll('p.text-xs, p.text-sm');
    roleLabels.forEach(label => {
      const text = label.textContent.toLowerCase();
      if (isAdmin) {
        if (text.includes('staff access') || text.includes('staff role')) {
          label.textContent = 'Admin Management';
        }
      } else if (isStaff) {
        if (text.includes('admin management') || text.includes('store owner') || text.includes('admin management')) {
          label.textContent = 'Staff Access';
        }
      }
    });
  };

  if (isAdmin) {
    document.body.classList.add('user-is-admin');
    document.body.classList.remove('user-is-staff');
    updateBrandAndLabels(true);
  } else if (isStaff) {
    document.body.classList.add('user-is-staff');
    document.body.classList.remove('user-is-admin');
    applyHiding();
    if (typeof applyStaffSidebar === 'function') {
      applyStaffSidebar();
    } else {
      updateBrandAndLabels(false);
    }
  }
}

function initSidebarRoles() {
  handleSidebarRoles();
  const role = (localStorage.getItem('kaabeRole') || '').toLowerCase().trim();
  if (role === 'staff' && typeof applyStaffSidebar === 'function') {
    applyStaffSidebar();
  }
}

initSidebarRoles();
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSidebarRoles);
}
