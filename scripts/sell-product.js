const staffSellGrid = document.getElementById('staffSellGrid');
const sellForm = document.getElementById('sellForm');
let sellingProduct = null;
let staffProductsCache = [];

function productImageSrc(product) {
  if (!product.imageUrl || typeof product.imageUrl !== 'string') return '';
  const base = typeof SERVER_URL !== 'undefined' ? SERVER_URL : 'http://127.0.0.1:3000';
  return product.imageUrl.startsWith('/') ? base + product.imageUrl : product.imageUrl;
}

function normalizeProductsList(response) {
  if (Array.isArray(response)) return response;
  if (response && Array.isArray(response.products)) return response.products;
  return [];
}

async function fetchInventoryForStaff() {
  try {
    // Always try the real API first — staff must see admin-added products
    const data = await apiFetch('/products');
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn('API unavailable, falling back to demo products:', err.message);
    if (typeof ensureDemoProducts === 'function') {
      return ensureDemoProducts();
    }
    return [];
  }
}

async function loadStaffSellView() {
  if (!staffSellGrid) return;

  staffSellGrid.innerHTML = `
    <div class="col-span-full py-12 flex flex-col items-center justify-center text-slate-400">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B80024] mb-4"></div>
      <p>Loading products from inventory...</p>
    </div>`;

  try {
    hideSellAlert();
  staffProductsCache = await fetchInventoryForStaff();

    if (!staffProductsCache.length) {
      staffSellGrid.innerHTML = `
        <div class="col-span-full py-12 text-center text-slate-500 space-y-2">
          <p class="font-medium text-lg">No products in inventory yet</p>
          <p class="text-sm">Ask the admin to add products first. They will appear here automatically for you to sell.</p>
        </div>`;
      return;
    }

    staffSellGrid.innerHTML = staffProductsCache.map(renderStaffSellCard).join('');
  } catch (error) {
    console.error(error);
    staffSellGrid.innerHTML = `
      <div class="col-span-full py-12 text-center space-y-2">
        <p class="font-medium text-rose-600">Could not load products</p>
        <p class="text-sm text-slate-500">${error.message || 'Check that the server is running and you are logged in as staff.'}</p>
        <button type="button" onclick="loadStaffSellView()" class="mt-4 px-5 py-2 rounded-2xl bg-[#B80024] text-white text-sm font-semibold">Retry</button>
      </div>`;
  }
}

function renderStaffSellCard(product) {
  const price = typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0;
  const qty = parseInt(product.quantity, 10) || 0;
  const outOfStock = qty < 1;
  const img = productImageSrc(product);
  const safeId = String(product._id).replace(/'/g, "\\'");

  return `
    <div class="product-card bg-white rounded-[28px] border border-slate-100 card-soft overflow-hidden">
      <div class="aspect-square bg-slate-100 relative">
        ${
          img
            ? `<img src="${img}" alt="${product.name}" class="h-full w-full object-cover" />`
            : '<div class="flex h-full w-full items-center justify-center text-4xl">📦</div>'
        }
        <div class="absolute top-3 right-3 bg-white/90 px-3 py-1 rounded-xl text-sm font-bold text-[#B80024]">$${price.toFixed(2)}</div>
      </div>
      <div class="p-5 space-y-3">
        <h3 class="font-semibold text-slate-900 truncate">${product.name}</h3>
        <p class="text-sm text-slate-500">${qty} in stock · ${product.category || 'General'}</p>
        ${outOfStock ? `<div class="mt-2"><span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">⚠ Sold out</span></div>` : ''}
        <button
          type="button"
          ${outOfStock ? 'disabled' : ''}
          onclick="openSellModal('${safeId}')"
          class="w-full rounded-2xl px-4 py-3 text-sm font-semibold transition ${
            outOfStock
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-[#B80024] text-white hover:bg-[#93001b]'
          }"
        >
          ${outOfStock ? 'Out of stock' : 'Sell'}
        </button>
      </div>
    </div>`;
}

function updateSellTotal() {
  if (!sellingProduct) return;
  const qtyInput = document.getElementById('sellQuantity');
  const totalEl = document.getElementById('sellTotalAmount');
  const price =
    typeof sellingProduct.price === 'number'
      ? sellingProduct.price
      : parseFloat(sellingProduct.price) || 0;
  const qty = Math.max(1, parseInt(qtyInput?.value, 10) || 1);
  if (totalEl) totalEl.textContent = `$${(price * qty).toFixed(2)}`;
}

function hideSellAlert() {
  const alertBox = document.getElementById('staffSellAlert');
  if (alertBox) {
    alertBox.classList.add('hidden');
    alertBox.textContent = '';
  }
}

function showSellWarning(message) {
  const alertBox = document.getElementById('staffSellAlert');
  if (!alertBox) return;
  alertBox.textContent = message;
  alertBox.className = 'rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700 mb-6';
  alertBox.classList.remove('hidden');
}

function showSellNotification(message) {
  const alertBox = document.getElementById('staffSellAlert');
  if (!alertBox) return;
  alertBox.textContent = message;
  alertBox.className = 'rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-700 mb-6';
  alertBox.classList.remove('hidden');
}

function openSellModal(productId) {
  const product = staffProductsCache.find((p) => String(p._id) === String(productId));
  const qty = parseInt(product?.quantity, 10) || 0;
  if (!product || qty < 1) {
    alert('This product is out of stock.');
    loadStaffSellView();
    return;
  }

  sellingProduct = product;
  const price =
    typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0;

  document.getElementById('sellProductName').textContent = product.name;
  document.getElementById('sellUnitPrice').textContent = `$${price.toFixed(2)}`;
  document.getElementById('sellStockAvailable').textContent = String(qty);
  const qtyInput = document.getElementById('sellQuantity');
  qtyInput.value = '1';
  qtyInput.min = '1';
  qtyInput.max = String(qty);
  document.getElementById('sellError')?.classList.add('hidden');
  updateSellTotal();
  openModal('sellModal');
}

async function submitSellForm(event) {
  event.preventDefault();
  if (!sellingProduct) return;

  const errorBox = document.getElementById('sellError');
  const quantity = parseInt(document.getElementById('sellQuantity').value, 10);
  const available = parseInt(sellingProduct.quantity, 10) || 0;

  if (!quantity || quantity < 1) {
    if (errorBox) {
      errorBox.textContent = 'Enter a valid quantity.';
      errorBox.classList.remove('hidden');
    }
    return;
  }

  if (quantity > available) {
    if (errorBox) {
      errorBox.textContent = `Only ${available} item(s) available in stock.`;
      errorBox.classList.remove('hidden');
    }
    return;
  }

  const submitBtn = sellForm.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing...';
  }

  try {
    const result = await apiFetch(`/products/${sellingProduct._id}/sell`, {
      method: 'POST',
      body: JSON.stringify({ quantity }),
    });

    closeModal('sellModal');
    const total = result.totalAmount ?? 0;
    const name = sellingProduct.name;
    const remaining = result.product?.quantity ?? 0;
    sellingProduct = null;
    if (remaining === 0) {
      showSellWarning(`Product \"${name}\" is sold out. Please restock this item.`);
    } else {
      showSellNotification(`Sale complete! ${quantity} × ${name} sold. Total: $${Number(total).toFixed(2)}.`);
    }
    await loadStaffSellView();
  } catch (error) {
    if (errorBox) {
      errorBox.textContent = error.message || 'Sale failed. Try again.';
      errorBox.classList.remove('hidden');
    }
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Confirm Sale';
    }
  }
}

window.openSellModal = openSellModal;
window.loadStaffSellView = loadStaffSellView;

if (sellForm) {
  sellForm.addEventListener('submit', submitSellForm);
  document.getElementById('sellQuantity')?.addEventListener('input', updateSellTotal);
}

if (typeof applyStaffProfile === 'function') applyStaffProfile();

loadStaffSellView().then(() => {
  const sellId = new URLSearchParams(window.location.search).get('sell');
  if (sellId) openSellModal(sellId);
});
