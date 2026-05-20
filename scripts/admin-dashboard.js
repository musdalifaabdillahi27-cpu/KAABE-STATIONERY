async function loadAdminDashboard() {
  protectRoute(['admin']);

  try {
    const debtData = await apiFetch('/debts');
    if (debtData?.summary) {
      document.getElementById('adminDebtOutstanding').textContent = `$${debtData.summary.outstanding.toFixed(2)}`;
      document.getElementById('adminDebtUnpaid').textContent = `${debtData.summary.unpaidCount}`;
      document.getElementById('adminDebtorCount').textContent = `${debtData.summary.debtorCount ?? debtData.summary.debtCount}`;
    }

    const staffUsers = await apiFetch('/users');
    if (Array.isArray(staffUsers)) {
      document.getElementById('adminStaffCount').textContent = `${staffUsers.length}`;
    }
  } catch (error) {
    console.error(error);
  }
}

window.loadAdminDashboard = loadAdminDashboard;
