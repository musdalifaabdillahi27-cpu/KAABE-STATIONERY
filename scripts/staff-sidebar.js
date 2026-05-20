function getStaffActivePage() {
  const page = (window.location.pathname.split('/').pop() || '').toLowerCase();
  if (page === 'sell-product.html' || page === 'products.html') return 'products';
  if (page === 'staff-debts.html' || page === 'debts.html') return 'debts';
  if (page === 'landing.html') return 'customer';
  return 'dashboard';
}

function staffNavClass(isActive) {
  return isActive
    ? 'flex items-center gap-3 px-4 py-3 rounded-3xl bg-white/15 hover:bg-white/20 transition'
    : 'flex items-center gap-3 px-4 py-3 rounded-3xl hover:bg-white/10 transition';
}

function buildStaffSidebarHTML(activePage) {
  const fullName = localStorage.getItem('kaabeFullName') || 'Staff Member';
  const initials =
    fullName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'SF';

  const nav = [
    { key: 'dashboard', href: 'staff-dashboard.html', icon: '🏠', label: 'Dashboard' },
    { key: 'products', href: 'sell-product.html', icon: '📦', label: 'Sell Product' },
    { key: 'debts', href: 'staff-debts.html', icon: '💳', label: 'Debt Information' },
    { key: 'customer', href: 'landing.html', icon: '🌐', label: 'Customer Page' },
  ];

  const navHtml = nav
    .map(
      (item) => `
    <a href="${item.href}" class="${staffNavClass(activePage === item.key)}">
      <span class="text-lg">${item.icon}</span>
      <span class="font-medium">${item.label}</span>
    </a>`
    )
    .join('');

  return `
    <div class="admin-sidebar-inner h-full bg-[#B80024] text-white">
      <div class="p-6 space-y-8">
        <div class="space-y-3">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center text-lg font-semibold">S</div>
            <div>
              <p class="text-sm uppercase tracking-[0.2em] font-semibold">KAABE STATIO</p>
              <p class="text-xs text-white/80">Staff Access</p>
            </div>
          </div>
        </div>
        <nav class="admin-sidebar-nav space-y-2">${navHtml}</nav>
      </div>
      <div class="admin-sidebar-profile p-6 border-t border-white/10">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-xl font-semibold">${initials}</div>
          <div>
            <p class="font-semibold">${fullName}</p>
            <p class="text-sm text-white/80">STAFF ROLE</p>
          </div>
        </div>
      </div>
    </div>`;
}

function buildStaffMobileMenuHTML(activePage) {
  const nav = [
    { key: 'dashboard', href: 'staff-dashboard.html', label: 'Dashboard' },
    { key: 'products', href: 'sell-product.html', label: 'Sell Product' },
    { key: 'debts', href: 'debts.html', label: 'Debt Information' },
    { key: 'customer', href: 'landing.html', label: 'Customer Page' },
  ];

  return nav
    .map((item) => {
      const active = activePage === item.key;
      return `<a href="${item.href}" class="block px-4 py-3 rounded-2xl ${
        active ? 'bg-[#FDE8EA] text-[#B80024]' : 'hover:bg-slate-100'
      }">${item.label}</a>`;
    })
    .join('');
}

function applyStaffSidebar() {
  if (/sell-product\.html$/i.test(window.location.pathname) || /staff-debts\.html$/i.test(window.location.pathname)) return;
  const activePage = getStaffActivePage();
  const aside = document.querySelector('aside');
  if (aside) {
    aside.className = 'admin-sidebar hidden lg:block';
    aside.innerHTML = buildStaffSidebarHTML(activePage);
  }

  const mobileNav = document.querySelector('#mobile-menu nav');
  if (mobileNav) {
    mobileNav.innerHTML = buildStaffMobileMenuHTML(activePage);
  }

  const mobileHeader = document.querySelector('main > div.lg\\:hidden .text-lg');
  if (mobileHeader) mobileHeader.textContent = 'KAABE STATIO';
}

window.applyStaffSidebar = applyStaffSidebar;
window.getStaffActivePage = getStaffActivePage;
