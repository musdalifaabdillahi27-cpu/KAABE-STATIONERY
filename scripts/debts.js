async function loadDebtsPage() {
  const role = getUserRole();
  if (role === 'staff' && !/staff-debts\.html$/i.test(window.location.pathname)) {
    window.location.replace('staff-debts.html');
    return;
  }
  if (typeof applyStaffProfile === 'function') applyStaffProfile();

  const isStaffDebtsPage = /staff-debts\.html$/i.test(window.location.pathname);
  if (!isStaffDebtsPage) {
    protectRoute(['admin']);
  }

  const actionButton = document.getElementById('debtActionButton');
  const createNotice = document.getElementById('debtCreateNotice');
  
  // Only staff can add debts, admin is read-only
  if (actionButton) actionButton.classList.toggle('hidden', role !== 'staff');
  if (createNotice) {
    createNotice.textContent = role === 'admin' ? 'View-only mode for administrators' : 'Only authorized users can add new debts';
    createNotice.classList.toggle('hidden', false);
  }
  
  hideDebtMessage();

  try {
    const data = await apiFetch('/debts');
    if (!data) {
      return;
    }

    const { debts, summary } = data;
    const outstandingEl = document.getElementById('outstandingAmount');
    const totalDebtsEl = document.getElementById('totalDebtCount');
    const unpaidEl = document.getElementById('unpaidCount');
    const collectedEl = document.getElementById('totalCollected');

    if (outstandingEl) outstandingEl.textContent = `$${summary.outstanding.toFixed(2)}`;
    if (totalDebtsEl) totalDebtsEl.textContent = `${summary.debtorCount ?? summary.debtCount}`;
    if (unpaidEl) unpaidEl.textContent = `${summary.unpaidCount}`;
    if (collectedEl) collectedEl.textContent = `$${summary.totalPaid.toFixed(2)}`;

    renderDebtTable(debts, role);
    
    // Hide Actions column header for Admin
    if (role === 'admin') {
      const headers = document.querySelectorAll('th');
      headers.forEach(th => {
        if (th.textContent.trim().toUpperCase() === 'ACTIONS') {
          th.style.display = 'none';
        }
      });
    }
  } catch (error) {
    console.error(error);
    showDebtMessage('Could not load debts. Check server connection.', true);
  }
}

function showDebtMessage(message, isError = false) {
  const messageEl = document.getElementById('debtStatusMessage');
  if (!messageEl) return;
  messageEl.textContent = message;
  messageEl.classList.toggle('text-red-600', isError);
  messageEl.classList.toggle('text-green-600', !isError);
  messageEl.classList.remove('hidden');
}

function hideDebtMessage() {
  const messageEl = document.getElementById('debtStatusMessage');
  if (!messageEl) return;
  messageEl.textContent = '';
  messageEl.classList.add('hidden');
}

function renderDebtTable(debts, role) {
  const tbody = document.getElementById('debtTableBody');
  if (!tbody) return;

  if (!debts || debts.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td class="py-8 px-4 text-center text-sm text-slate-500" colspan="6">No debt records found. Add a new debt to start tracking customer liabilities.</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = debts
    .map((debt) => {
      const statusClass = debt.status === 'Paid' ? 'badge-paid' : debt.status === 'Partial' ? 'badge-partial' : 'badge-unpaid';
      const pending = Math.max(0, debt.totalAmount - debt.amountPaid);
      const isStaff = role === 'staff';
      
      const actions = isStaff
        ? `<button class="px-4 py-2 rounded-2xl border border-[#B80024] text-[#B80024] hover:bg-[#B80024]/10 transition" onclick="openEditDebt('${debt._id}')">Edit</button>`
        : ''; // Admin gets no buttons in actions column

      return `
        <tr class="hover:bg-slate-50 transition">
          <td class="py-4 px-4">
            <p class="font-semibold">${debt.customerName}</p>
            <p class="text-xs text-slate-500">ID: #DBT-${debt._id.slice(-6)}</p>
          </td>
          <td class="py-4 px-4">${debt.phone}</td>
          <td class="py-4 px-4">${new Date(debt.issueDate).toLocaleDateString()}</td>
          <td class="py-4 px-4 font-semibold">$${debt.totalAmount.toFixed(2)}<br><span class="text-xs text-slate-500">Pending: $${pending.toFixed(2)}</span></td>
          <td class="py-4 px-4"><span class="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusClass}">${debt.status}</span></td>
          ${isStaff ? `<td class="py-4 px-4">${actions}</td>` : '<td class="py-4 px-4 hidden"></td>'}
        </tr>`;
    })
    .join('');
}

async function handleDebtCreate(event) {
  event.preventDefault();
  const form = document.getElementById('debtForm');
  if (!form) return;

  const payload = {
    customerName: form.customerName.value.trim(),
    phone: form.phone.value.trim(),
    issueDate: form.issueDate.value,
    totalAmount: Number(form.totalAmount.value),
    amountPaid: 0,
    status: 'Unpaid',
    notes: '',
  };

  try {
    await apiFetch('/debts', { method: 'POST', body: JSON.stringify(payload) });
    closeModal('debtModal');
    form.reset();
    showDebtMessage('New debt added successfully.');
    loadDebtsPage();
  } catch (error) {
    console.error(error);
    showDebtMessage('Unable to add debt. Please try again.', true);
  }
}

let currentDebtId = null;

async function openEditDebt(id) {
  currentDebtId = id;
  const response = await apiFetch(`/debts`);
  const debt = response?.debts?.find((item) => item._id === id);
  if (!debt) return;

  const form = document.getElementById('paymentForm');
  if (!form) return;

  form.debtCustomerName.value = debt.customerName || '';
  form.debtTotalAmount.value = debt.totalAmount || 0;
  form.debtAmountPaid.value = debt.amountPaid || 0;
  updateDebtRemaining();
  openModal('paymentModal');
}

function updateDebtRemaining() {
  const form = document.getElementById('paymentForm');
  if (!form) return;

  const total = Number(form.debtTotalAmount.value) || 0;
  const paid = Number(form.debtAmountPaid.value) || 0;
  const remaining = Math.max(0, total - paid);

  const remainingField = form.debtRemainingAmount;
  if (remainingField) {
    remainingField.value = `$${remaining.toFixed(2)}`;
  }
}

async function handleDebtUpdate(event) {
  event.preventDefault();
  if (!currentDebtId) return;

  const form = document.getElementById('paymentForm');
  if (!form) return;

  const customerName = form.debtCustomerName.value.trim();
  const totalAmount = Number(form.debtTotalAmount.value) || 0;
  const amountPaid = Number(form.debtAmountPaid.value) || 0;

  const payload = {
    customerName,
    totalAmount,
    amountPaid,
    status: amountPaid >= totalAmount ? 'Paid' : amountPaid > 0 ? 'Partial' : 'Unpaid',
  };

  try {
    await apiFetch(`/debts/${currentDebtId}`, { method: 'PUT', body: JSON.stringify(payload) });
    closeModal('paymentModal');
    currentDebtId = null;
    loadDebtsPage();
  } catch (error) {
    console.error(error);
  }
}

window.loadDebtsPage = loadDebtsPage;
window.handleDebtCreate = handleDebtCreate;
window.openEditDebt = openEditDebt;
window.handleDebtUpdate = handleDebtUpdate;
