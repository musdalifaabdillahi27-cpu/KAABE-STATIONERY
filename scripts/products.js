const productTableBody = document.getElementById('productsTableBody');
const productForm = document.getElementById('productForm');
const modalTitle = document.getElementById('productModalTitle');
const saveButton = document.getElementById('saveProductButton');
const staffSellSection = document.getElementById('staffSellSection');
const staffSellGrid = document.getElementById('staffSellGrid');
const adminProductsSection = document.getElementById('adminProductsSection');
const sellForm = document.getElementById('sellForm');
let editingProductId = null;
let sellingProduct = null;
let staffProductsCache = [];

function isStaffUser() {
  return (localStorage.getItem('kaabeRole') || '').toLowerCase() === 'staff';
}

function productImageSrc(product) {
  if (!product.imageUrl || typeof product.imageUrl !== 'string') return '';
  return product.imageUrl.startsWith('/') ? SERVER_URL + product.imageUrl : product.imageUrl;
}

async function loadProducts() {
  try {
    const products = await apiFetch('/products');
    productTableBody.innerHTML = products.map(renderProductRow).join('');
    
    // Hide Actions header if staff
    const role = (localStorage.getItem('kaabeRole') || '').toLowerCase().trim();
    const headers = document.querySelectorAll('th');
    headers.forEach(th => {
      if (th.textContent.trim().toUpperCase() === 'ACTIONS') {
        if (role === 'staff') {
          th.style.display = 'none';
          th.classList.add('hidden');
        } else {
          th.style.display = '';
          th.classList.remove('hidden');
        }
      }
    });
  } catch (error) {
    console.error(error);
    alert('Unable to load products. Please login again.');
  }
}

function renderProductRow(product) {
  const price = typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0;
  const role = localStorage.getItem('kaabeRole');
  const isAdmin = role === 'admin';

  return `
    <tr class="hover:bg-slate-50 transition">
      <td class="py-4 px-4 w-16">
        <div class="h-10 w-10 overflow-hidden rounded-xl bg-slate-100 border border-slate-200">
          ${(product.imageUrl && typeof product.imageUrl === 'string') ? `<img src="${product.imageUrl.startsWith('/') ? SERVER_URL + product.imageUrl : product.imageUrl}" alt="${product.name}" class="h-full w-full object-cover" />` : '<div class="flex h-full w-full items-center justify-center text-slate-400 text-xs">No img</div>'}
        </div>
      </td>
      <td class="py-4 px-4 font-semibold">${product.name}</td>
      <td class="py-4 px-4">$${price.toFixed(2)}</td>
      <td class="py-4 px-4">${product.quantity}</td>
      <td class="py-4 px-4">${product.category}</td>
      <td class="py-4 px-4 flex gap-2 ${isAdmin ? '' : 'hidden'}">
        <button class="px-3 py-2 rounded-2xl border border-[#B80024] text-[#B80024] hover:bg-[#B80024]/10 transition" onclick="openEditProduct('${product._id}')">Edit</button>
        <button class="px-3 py-2 rounded-2xl bg-[#B80024] text-white hover:bg-[#93001b] transition" onclick="deleteProduct('${product._id}')">Delete</button>
      </td>
    </tr>
  `;
}

async function openAddProduct() {
  editingProductId = null;
  modalTitle.textContent = 'Add New Product';
  saveButton.textContent = 'Create Product';
  productForm.reset();
  if (document.getElementById('productImageUrl')) document.getElementById('productImageUrl').value = '';
  previewImage();
  updateFileName();
  openModal('productModal');
}

async function openEditProduct(productId) {
  try {
    const products = await apiFetch('/products');
    const product = products.find((item) => item._id === productId);
    if (!product) return;

    editingProductId = productId;
    modalTitle.textContent = 'Edit Product';
    saveButton.textContent = 'Update Product';
    document.getElementById('productName').value = product.name;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productQuantity').value = product.quantity;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productDescription').value = product.description;
    
    const urlInput = document.getElementById('productImageUrl');
    if (urlInput) urlInput.value = product.imageUrl || '';
    previewImage();

    const fileInput = document.getElementById('productImageFile');
    if (fileInput) fileInput.value = '';
    updateFileName();
    openModal('productModal');
  } catch (error) {
    console.error(error);
    alert('Unable to load product details.');
  }
}

async function submitProductForm(event) {
  event.preventDefault();

  const formData = new FormData();
  formData.append('name', document.getElementById('productName').value.trim());
  formData.append('price', parseFloat(document.getElementById('productPrice').value));
  formData.append('quantity', parseInt(document.getElementById('productQuantity').value, 10));
  formData.append('category', document.getElementById('productCategory').value.trim());
  formData.append('description', document.getElementById('productDescription').value.trim());
  
  const urlInput = document.getElementById('productImageUrl');
  if (urlInput && urlInput.value.trim()) {
    formData.append('imageUrl', urlInput.value.trim());
  }

  const fileInput = document.getElementById('productImageFile');
  if (fileInput && fileInput.files[0]) {
    const token = typeof getAuthToken === 'function' ? getAuthToken() : '';
    if (token && token.startsWith('demo-token-')) {
      // In Demo Mode, convert file to Data URL so it can be saved in localStorage
      const dataUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(fileInput.files[0]);
      });
      formData.set('imageUrl', dataUrl);
    } else {
      formData.append('image', fileInput.files[0]);
    }
  }

  try {
    if (editingProductId) {
      await apiFetch(`/products/${editingProductId}`, {
        method: 'PUT',
        body: formData,
      });
    } else {
      await apiFetch('/products', {
        method: 'POST',
        body: formData,
      });
    }

    closeModal('productModal');
    await loadProducts();
  } catch (error) {
    console.error(error);
    alert(error.message || 'Unable to save product.');
  }
}

function previewImage() {
  const url = document.getElementById('productImageUrl').value.trim();
  const preview = document.getElementById('imagePreview');
  const container = document.getElementById('imagePreviewContainer');
  const icon = document.getElementById('uploadIcon');

  if (url) {
    preview.src = url;
    container.classList.remove('hidden');
    if (icon) icon.classList.add('hidden');
  } else {
    preview.src = '#';
    container.classList.add('hidden');
    if (icon) icon.classList.remove('hidden');
  }
}

function previewFile() {
  const fileInput = document.getElementById('productImageFile');
  const preview = document.getElementById('imagePreview');
  const container = document.getElementById('imagePreviewContainer');
  const icon = document.getElementById('uploadIcon');

  if (fileInput.files && fileInput.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      preview.src = e.target.result;
      container.classList.remove('hidden');
      if (icon) icon.classList.add('hidden');
    };
    reader.readAsDataURL(fileInput.files[0]);
  }
}

window.previewImage = previewImage;
window.previewFile = previewFile;

async function deleteProduct(productId) {
  if (!confirm('Delete this product?')) return;
  try {
    await apiFetch(`/products/${productId}`, { method: 'DELETE' });
    await loadProducts();
  } catch (error) {
    console.error(error);
    alert('Unable to delete product.');
  }
}

window.openAddProduct = openAddProduct;
window.openEditProduct = openEditProduct;
window.deleteProduct = deleteProduct;

async function loadStaffSellView() {
  if (!staffSellGrid) return;

  const title = document.getElementById('productsPageTitle');
  const subtitle = document.getElementById('productsPageSubtitle');
  if (title) title.textContent = 'Sell Product';
  if (subtitle) subtitle.textContent = 'Select a product and complete a sale. Stock updates automatically.';

  if (staffSellSection) staffSellSection.classList.remove('hidden');
  if (adminProductsSection) adminProductsSection.classList.add('hidden');

  try {
    staffProductsCache = await apiFetch('/products');
    if (!staffProductsCache.length) {
      staffSellGrid.innerHTML =
        '<div class="col-span-full py-12 text-center text-slate-500"><p class="font-medium">No products available to sell</p></div>';
      return;
    }
    staffSellGrid.innerHTML = staffProductsCache.map(renderStaffSellCard).join('');
  } catch (error) {
    staffSellGrid.innerHTML = `<div class="col-span-full py-12 text-center text-rose-500">${error.message}</div>`;
  }
}

function renderStaffSellCard(product) {
  const price = typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0;
  const outOfStock = !product.quantity || product.quantity < 1;
  const img = productImageSrc(product);

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
        <p class="text-sm text-slate-500">${product.quantity || 0} in stock · ${product.category || 'General'}</p>
        <button
          type="button"
          ${outOfStock ? 'disabled' : ''}
          onclick="openSellModal('${product._id}')"
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

function openSellModal(productId) {
  const product = staffProductsCache.find((p) => p._id === productId);
  if (!product || !product.quantity) return;

  sellingProduct = product;
  const price =
    typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0;

  document.getElementById('sellProductName').textContent = product.name;
  document.getElementById('sellUnitPrice').textContent = `$${price.toFixed(2)}`;
  document.getElementById('sellStockAvailable').textContent = String(product.quantity);
  const qtyInput = document.getElementById('sellQuantity');
  qtyInput.value = '1';
  qtyInput.max = String(product.quantity);
  document.getElementById('sellError')?.classList.add('hidden');
  updateSellTotal();
  openModal('sellModal');
}

async function submitSellForm(event) {
  event.preventDefault();
  if (!sellingProduct) return;

  const errorBox = document.getElementById('sellError');
  const quantity = parseInt(document.getElementById('sellQuantity').value, 10);

  if (!quantity || quantity < 1) {
    if (errorBox) {
      errorBox.textContent = 'Enter a valid quantity.';
      errorBox.classList.remove('hidden');
    }
    return;
  }

  if (quantity > sellingProduct.quantity) {
    if (errorBox) {
      errorBox.textContent = 'Not enough stock available.';
      errorBox.classList.remove('hidden');
    }
    return;
  }

  try {
    const result = await apiFetch(`/products/${sellingProduct._id}/sell`, {
      method: 'POST',
      body: JSON.stringify({ quantity }),
    });

    closeModal('sellModal');
    const total = result.totalAmount ?? 0;
    alert(`Sale complete! ${quantity} × ${sellingProduct.name} — Total: $${Number(total).toFixed(2)}`);
    sellingProduct = null;
    await loadStaffSellView();
  } catch (error) {
    if (errorBox) {
      errorBox.textContent = error.message || 'Sale failed.';
      errorBox.classList.remove('hidden');
    }
  }
}

window.openSellModal = openSellModal;

if (sellForm) {
  sellForm.addEventListener('submit', submitSellForm);
  document.getElementById('sellQuantity')?.addEventListener('input', updateSellTotal);
}

async function initProductsPage() {
  if (isStaffUser()) {
    const query = window.location.search || '';
    window.location.replace('sell-product.html' + query);
    return;
  }
  if (productTableBody) await loadProducts();
}

if (productForm) {
  productForm.addEventListener('submit', submitProductForm);
}

initProductsPage();

function updateFileName() {
  const fileInput = document.getElementById('productImageFile');
  const title = document.getElementById('uploadImageTitle');
  const subtitle = document.getElementById('uploadImageSubtitle');
  if (!fileInput || !title || !subtitle) return;
  
  if (fileInput.files.length > 0) {
    title.textContent = 'Image selected';
    subtitle.textContent = fileInput.files[0].name;
    subtitle.classList.add('text-[#B80024]', 'font-medium');
  } else {
    title.textContent = 'Click to upload image';
    subtitle.textContent = 'PNG, JPG, or WebP (max. 5MB)';
    subtitle.classList.remove('text-[#B80024]', 'font-medium');
  }
}
window.updateFileName = updateFileName;
