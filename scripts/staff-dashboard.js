const galleryContainer = document.getElementById('staffProductGallery');

async function loadStaffGallery() {
  if (!galleryContainer) return;

  galleryContainer.innerHTML = `
    <div class="col-span-full py-12 flex flex-col items-center justify-center text-slate-400">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B80024] mb-4"></div>
      <p>Loading products...</p>
    </div>`;

  let products = [];

  try {
    // Always try the real API first — admin products must show for staff
    const data = await apiFetch('/products');
    products = Array.isArray(data) ? data : [];
  } catch (apiError) {
    console.warn('API unavailable, falling back to demo products:', apiError.message);
    // Only fall back to demo mode if server is truly unreachable
    if (typeof ensureDemoProducts === 'function') {
      products = ensureDemoProducts();
    }
  }

  if (products.length === 0) {
    galleryContainer.innerHTML = `
      <div class="col-span-full py-12 text-center text-slate-500">
        <p class="text-lg font-medium">No products available</p>
        <p class="text-sm">Ask the admin to add products to the inventory.</p>
      </div>
    `;
    return;
  }

  galleryContainer.innerHTML = products.map(renderStaffProductCard).join('');
}

function renderStaffProductCard(product) {
  const stockColor = product.quantity > 50 ? 'text-emerald-600 bg-emerald-50' : 
                    (product.quantity > 0 ? 'text-amber-600 bg-amber-50' : 'text-rose-600 bg-rose-50');
  
  const stockText = product.quantity > 0 ? `${product.quantity} in stock` : 'Out of stock';

  return `
    <div class="product-card group relative bg-white rounded-[32px] overflow-hidden border border-slate-100 card-soft transition-all duration-500 hover:-translate-y-2">
      <!-- Image Container -->
      <div class="aspect-square w-full overflow-hidden bg-slate-100 relative">
        ${(product.imageUrl && typeof product.imageUrl === 'string') 
          ? `<img src="${product.imageUrl.startsWith('/') ? SERVER_URL + product.imageUrl : product.imageUrl}" alt="${product.name}" class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />`
          : `<div class="flex h-full w-full items-center justify-center text-slate-300 font-bold text-4xl">📦</div>`
        }
        
        <!-- Price Tag -->
        <div class="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm border border-white/20">
          <p class="text-sm font-bold text-brand">$${product.price.toFixed(2)}</p>
        </div>
      </div>

      <!-- Content -->
      <div class="p-6">
        <div class="flex items-center gap-2 mb-3">
          <span class="px-3 py-1 rounded-full bg-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-500">${product.category || 'General'}</span>
          <span class="px-3 py-1 rounded-full ${stockColor} text-[10px] font-bold uppercase tracking-wider">${stockText}</span>
        </div>
        
        <h3 class="text-lg font-semibold text-slate-900 mb-2 truncate">${product.name}</h3>
        <p class="text-sm text-slate-500 line-clamp-2 mb-4 h-10">${product.description || 'No description provided for this stationery item.'}</p>
        
        <div class="pt-4 border-t border-slate-50 flex items-center justify-between">
          <div class="flex -space-x-2">
             <div class="w-8 h-8 rounded-full bg-brand/10 border-2 border-white flex items-center justify-center text-[10px] text-brand font-bold">K</div>
             <div class="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] text-slate-500 font-bold">+</div>
          </div>
          <button onclick="window.location.href='sell-product.html?sell=${product._id}'" class="px-4 py-2 rounded-xl bg-[#B80024] text-white text-sm font-semibold hover:bg-[#93001b] transition">
            Sell
          </button>
        </div>
      </div>
    </div>
  `;
}

// Initial load
if (galleryContainer) {
  loadStaffGallery();
}
