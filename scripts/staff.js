async function loadStaffManagement() {
  protectRoute(['admin']);
  try {
    const staffUsers = await apiFetch('/users');
    if (!staffUsers) {
      return;
    }
    const tbody = document.getElementById('staffTableBody');
    if (!tbody) return;
    tbody.innerHTML = staffUsers
      .map(
        (user) => `
          <tr class="hover:bg-slate-50 transition">
            <td class="py-4 px-4 font-semibold">${user.fullName || 'Staff User'}</td>
            <td class="py-4 px-4">${user.username}</td>
            <td class="py-4 px-4">
              <span class="px-2 py-1 rounded-full text-xs font-semibold ${user.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'}">
                ${user.role}
              </span>
            </td>
            <td class="py-4 px-4">
              ${user.role !== 'admin' ? `
                <button onclick="deleteStaff('${user._id}')" class="text-rose-600 hover:text-rose-800 font-medium transition">Delete</button>
              ` : ''}
            </td>
          </tr>`
      )
      .join('');
    document.getElementById('staffCount').textContent = `${staffUsers.length}`;
  } catch (error) {
    console.error(error);
  }
}

async function deleteStaff(id) {
  if (!confirm('Are you sure you want to delete this staff member?')) return;
  try {
    await apiFetch(`/users/${id}`, { method: 'DELETE' });
    loadStaffManagement();
  } catch (error) {
    console.error(error);
    alert('Unable to delete staff member.');
  }
}

async function handleStaffCreate(event) {
  event.preventDefault();
  const form = document.getElementById('staffForm');
  if (!form) return;

  const payload = {
    username: form.username.value.trim(),
    password: form.password.value,
    fullName: form.fullName.value.trim(),
    role: 'staff'
  };

  try {
    await apiFetch('/users', { method: 'POST', body: JSON.stringify(payload) });
    form.reset();
    loadStaffManagement();
  } catch (error) {
    const errorBox = document.getElementById('staffError');
    if (errorBox) {
      errorBox.textContent = error.message;
      errorBox.classList.remove('hidden');
    }
    console.error(error);
  }
}

window.loadStaffManagement = loadStaffManagement;
window.handleStaffCreate = handleStaffCreate;
window.deleteStaff = deleteStaff;
