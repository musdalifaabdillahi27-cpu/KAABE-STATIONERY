function applyStaffProfile() {
  const fullName = localStorage.getItem('kaabeFullName') || 'Staff Member';
  const initials =
    fullName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'SF';
  const nameEl = document.getElementById('staffProfileName');
  const initialsEl = document.getElementById('staffProfileInitials');
  if (nameEl) nameEl.textContent = fullName;
  if (initialsEl) initialsEl.textContent = initials;
}

window.applyStaffProfile = applyStaffProfile;

if (document.getElementById('staffProfileName')) {
  applyStaffProfile();
}
