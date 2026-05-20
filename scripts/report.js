/* ============================================================
   report.js  —  Monthly Invoice / Report Generator
   KAABE STATIO Admin Dashboard
   ============================================================ */

async function generateReport() {
  const modal = document.getElementById('reportModal');

  // Set month label and generated time
  const now = new Date();
  const monthLabel = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const generatedAt = now.toLocaleString('en-US', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  document.getElementById('reportMonthLabel').textContent = monthLabel;
  document.getElementById('reportGeneratedAt').textContent = 'Generated: ' + generatedAt;
  document.getElementById('reportFooterDate').textContent = generatedAt;

  // Show modal with loading state
  modal.classList.remove('hidden');

  try {
    // ── Fetch products ──────────────────────────────────────
    const products = await apiFetch('/products');

    const totalStockValue = products.reduce((sum, p) => {
      const price = typeof p.price === 'number' ? p.price : parseFloat(p.price) || 0;
      const qty   = typeof p.quantity === 'number' ? p.quantity : parseInt(p.quantity) || 0;
      return sum + price * qty;
    }, 0);

    document.getElementById('reportTotalRevenue').textContent  = '$' + totalStockValue.toFixed(2);
    document.getElementById('reportProductCount').textContent  = products.length;

    // Build products table rows
    const tbody = document.getElementById('reportProductsTable');
    if (products.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="px-5 py-8 text-center text-slate-400">No products found.</td></tr>`;
    } else {
      tbody.innerHTML = products.map((p, i) => {
        const price = typeof p.price === 'number' ? p.price : parseFloat(p.price) || 0;
        const qty   = typeof p.quantity === 'number' ? p.quantity : parseInt(p.quantity) || 0;
        const value = price * qty;
        const lowStock = qty < 10;
        return `
          <tr class="hover:bg-slate-50 transition">
            <td class="px-5 py-3 text-slate-400">${i + 1}</td>
            <td class="px-5 py-3 font-medium text-slate-900">${p.name}</td>
            <td class="px-5 py-3 text-slate-500">${p.category || '—'}</td>
            <td class="px-5 py-3 text-right">$${price.toFixed(2)}</td>
            <td class="px-5 py-3 text-right ${lowStock ? 'text-rose-500 font-semibold' : ''}">${qty}${lowStock ? ' ⚠' : ''}</td>
            <td class="px-5 py-3 text-right font-semibold text-slate-900">$${value.toFixed(2)}</td>
          </tr>
        `;
      }).join('');
    }

    // ── Fetch debts ─────────────────────────────────────────
    const debtData = await apiFetch('/debts');
    const summary  = debtData?.summary || {};
    const debts    = debtData?.debts   || [];

    document.getElementById('reportOutstandingDebt').textContent = '$' + (summary.outstanding || 0).toFixed(2);

    // Debt list
    const debtContainer = document.getElementById('reportDebtList');
    if (debts.length === 0) {
      debtContainer.innerHTML = `<p class="text-sm text-slate-400">No debt records found.</p>`;
    } else {
      // Summary row first
      debtContainer.innerHTML = `
        <div class="grid grid-cols-3 gap-3 mb-4">
          <div class="rounded-xl border border-slate-100 p-3">
            <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Total Billed</p>
            <p class="text-base font-bold text-slate-900">$${(summary.totalAmount || 0).toFixed(2)}</p>
          </div>
          <div class="rounded-xl border border-slate-100 p-3">
            <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Total Paid</p>
            <p class="text-base font-bold text-emerald-600">$${(summary.totalPaid || 0).toFixed(2)}</p>
          </div>
          <div class="rounded-xl border border-rose-100 bg-rose-50 p-3">
            <p class="text-[10px] font-bold uppercase tracking-widest text-rose-400 mb-1">Outstanding</p>
            <p class="text-base font-bold text-rose-600">$${(summary.outstanding || 0).toFixed(2)}</p>
          </div>
        </div>
        <div class="rounded-2xl border border-slate-100 overflow-hidden">
          <table class="min-w-full text-sm text-left">
            <thead class="bg-slate-50 text-slate-500 text-[12px] uppercase tracking-wider">
              <tr>
                <th class="px-5 py-3 font-semibold">Customer</th>
                <th class="px-5 py-3 font-semibold">Phone</th>
                <th class="px-5 py-3 font-semibold text-right">Total</th>
                <th class="px-5 py-3 font-semibold text-right">Paid</th>
                <th class="px-5 py-3 font-semibold text-right">Remaining</th>
                <th class="px-5 py-3 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-slate-700">
              ${debts.map(d => {
                const total     = parseFloat(d.totalAmount) || 0;
                const paid      = parseFloat(d.amountPaid)  || 0;
                const remaining = Math.max(0, total - paid);
                const isPaid    = d.status === 'Paid';
                return `
                  <tr class="hover:bg-slate-50 transition">
                    <td class="px-5 py-3 font-medium text-slate-900">${d.customerName || '—'}</td>
                    <td class="px-5 py-3 text-slate-500">${d.phone || '—'}</td>
                    <td class="px-5 py-3 text-right">$${total.toFixed(2)}</td>
                    <td class="px-5 py-3 text-right text-emerald-600">$${paid.toFixed(2)}</td>
                    <td class="px-5 py-3 text-right font-semibold ${remaining > 0 ? 'text-rose-500' : 'text-slate-400'}">$${remaining.toFixed(2)}</td>
                    <td class="px-5 py-3 text-center">
                      <span class="inline-block px-2 py-1 rounded-lg text-[11px] font-bold ${isPaid ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-600'}">${d.status || 'Unpaid'}</span>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

  } catch (err) {
    console.error('Report error:', err);
    document.getElementById('reportProductsTable').innerHTML =
      `<tr><td colspan="6" class="px-5 py-6 text-center text-rose-500">Failed to load data. Please ensure the server is running.</td></tr>`;
  }
}

function closeReportModal() {
  document.getElementById('reportModal').classList.add('hidden');
}

function printReport() {
  const now       = new Date();
  const monthLabel = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const generatedAt = now.toLocaleString('en-US', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  // Collect rendered table data from the modal
  const productsHTML = document.getElementById('reportProductsTable').innerHTML;
  const debtHTML     = document.getElementById('reportDebtList').innerHTML;
  const revenue      = document.getElementById('reportTotalRevenue').textContent;
  const productCount = document.getElementById('reportProductCount').textContent;
  const outstanding  = document.getElementById('reportOutstandingDebt').textContent;

  const printHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>KAABE STATIO — Monthly Report ${monthLabel}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Arial', sans-serif;
      font-size: 13px;
      color: #1e293b;
      background: #fff;
      padding: 40px;
    }

    /* ── Header ── */
    .invoice-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 32px;
      padding-bottom: 24px;
      border-bottom: 2px solid #B80024;
    }
    .brand { display: flex; align-items: center; gap: 12px; }
    .brand-icon {
      width: 44px; height: 44px;
      background: #B80024;
      color: white;
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      font-size: 20px; font-weight: 700;
    }
    .brand-name { font-size: 18px; font-weight: 700; color: #0f172a; }
    .brand-sub  { font-size: 11px; color: #94a3b8; margin-top: 2px; }
    .invoice-meta { text-align: right; }
    .invoice-meta .report-label {
      font-size: 10px; font-weight: 700;
      text-transform: uppercase; letter-spacing: 2px;
      color: #B80024; margin-bottom: 4px;
    }
    .invoice-meta .report-month { font-size: 20px; font-weight: 700; color: #0f172a; }
    .invoice-meta .report-date  { font-size: 11px; color: #94a3b8; margin-top: 3px; }

    /* ── Summary cards ── */
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 32px;
    }
    .summary-card {
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px 20px;
    }
    .summary-card.accent { background: #FDE8EA; border-color: #fca5a5; }
    .summary-card .card-label {
      font-size: 9px; font-weight: 700;
      text-transform: uppercase; letter-spacing: 1.5px;
      color: #94a3b8; margin-bottom: 6px;
    }
    .summary-card.accent .card-label { color: #B80024; }
    .summary-card .card-value { font-size: 22px; font-weight: 700; color: #0f172a; }
    .summary-card.accent .card-value { color: #B80024; }

    /* ── Section title ── */
    .section-title {
      font-size: 10px; font-weight: 700;
      text-transform: uppercase; letter-spacing: 2px;
      color: #94a3b8;
      margin-bottom: 12px;
      margin-top: 28px;
    }

    /* ── Tables ── */
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    thead tr { background: #f8fafc; }
    th {
      padding: 10px 14px;
      font-size: 10px; font-weight: 700;
      text-transform: uppercase; letter-spacing: 1px;
      color: #64748b;
      border-bottom: 1px solid #e2e8f0;
      text-align: left;
    }
    th.right, td.right { text-align: right; }
    th.center, td.center { text-align: center; }
    td {
      padding: 10px 14px;
      border-bottom: 1px solid #f1f5f9;
      color: #334155;
    }
    tr:last-child td { border-bottom: none; }
    tbody tr:hover { background: #f8fafc; }
    .num { font-weight: 600; color: #0f172a; }
    .muted { color: #94a3b8; }
    .red   { color: #ef4444; font-weight: 600; }
    .green { color: #16a34a; }

    /* Status badge */
    .badge {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 6px;
      font-size: 10px; font-weight: 700;
    }
    .badge-paid   { background: #dcfce7; color: #15803d; }
    .badge-unpaid { background: #fee2e2; color: #b91c1c; }
    .badge-warn   { background: #fef9c3; color: #a16207; }

    /* Debt summary mini-cards */
    .debt-summary {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 16px;
    }
    .ds-card {
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 12px 16px;
    }
    .ds-card.red-card { background: #fff1f2; border-color: #fca5a5; }
    .ds-card .ds-label {
      font-size: 9px; font-weight: 700;
      text-transform: uppercase; letter-spacing: 1.5px;
      color: #94a3b8; margin-bottom: 4px;
    }
    .ds-card.red-card .ds-label { color: #B80024; }
    .ds-card .ds-val { font-size: 16px; font-weight: 700; color: #0f172a; }
    .ds-card.red-card .ds-val { color: #B80024; }

    /* ── Footer ── */
    .invoice-footer {
      display: flex;
      justify-content: space-between;
      margin-top: 32px;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
      font-size: 10px;
      color: #94a3b8;
    }

    /* ── Print styles ── */
    @page { size: A4; margin: 20mm 15mm; }
    @media print {
      body { padding: 0; }
      .no-print { display: none !important; }
    }

    /* Print button (screen only) */
    .print-btn-wrap {
      text-align: right;
      margin-bottom: 24px;
    }
    .print-btn {
      background: #B80024; color: white;
      border: none; cursor: pointer;
      padding: 10px 24px; border-radius: 8px;
      font-size: 13px; font-weight: 700;
    }
    .print-btn:hover { background: #93001b; }
  </style>
</head>
<body>

  <div class="print-btn-wrap no-print">
    <button class="print-btn" onclick="window.print()">🖨 Print / Save as PDF</button>
  </div>

  <!-- Header -->
  <div class="invoice-header">
    <div class="brand">
      <div class="brand-icon">S</div>
      <div>
        <div class="brand-name">KAABE STATIO</div>
        <div class="brand-sub">Mogadishu, Somalia · kaabe.statio</div>
      </div>
    </div>
    <div class="invoice-meta">
      <div class="report-label">Monthly Report</div>
      <div class="report-month">${monthLabel}</div>
      <div class="report-date">Generated: ${generatedAt}</div>
    </div>
  </div>

  <!-- Summary cards -->
  <div class="summary-grid">
    <div class="summary-card accent">
      <div class="card-label">Total Stock Value</div>
      <div class="card-value">${revenue}</div>
    </div>
    <div class="summary-card">
      <div class="card-label">Products in Stock</div>
      <div class="card-value">${productCount}</div>
    </div>
    <div class="summary-card">
      <div class="card-label">Outstanding Debt</div>
      <div class="card-value">${outstanding}</div>
    </div>
  </div>

  <!-- Products table -->
  <div class="section-title">Current Inventory</div>
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Product</th>
        <th>Category</th>
        <th class="right">Unit Price</th>
        <th class="right">Qty in Stock</th>
        <th class="right">Stock Value</th>
      </tr>
    </thead>
    <tbody>${productsHTML}</tbody>
  </table>

  <!-- Debt section -->
  <div class="section-title">Debt Summary</div>
  <div>${debtHTML}</div>

  <!-- Footer -->
  <div class="invoice-footer">
    <span>KAABE STATIO — Confidential Internal Report</span>
    <span>${generatedAt}</span>
  </div>

  <script>
    // Auto-trigger print if opened via button
    window.onload = function() {
      // slight delay so styles render
      setTimeout(() => {}, 300);
    };
  <\/script>
</body>
</html>`;

  const printWin = window.open('', '_blank', 'width=900,height=700');
  printWin.document.write(printHTML);
  printWin.document.close();
  printWin.focus();
}

// Close on backdrop click
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('reportModal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeReportModal();
    });
  }
});

window.generateReport   = generateReport;
window.closeReportModal = closeReportModal;
window.printReport      = printReport;
