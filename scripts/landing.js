function productImageSrc(product) {
  if (!product.imageUrl || typeof product.imageUrl !== 'string') return 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80'; // fallback
  const base = typeof SERVER_URL !== 'undefined' ? SERVER_URL : 'http://127.0.0.1:3000';
  return product.imageUrl.startsWith('/') ? base + product.imageUrl : product.imageUrl;
}

async function loadLandingProducts() {
  const productsGrid = document.getElementById('landingProductsGrid');
  if (!productsGrid) return;

  productsGrid.innerHTML = `
    <div class="col-span-full py-12 flex flex-col items-center justify-center text-slate-400">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B80024] mb-4"></div>
      <p>Loading catalog...</p>
    </div>`;

  try {
    let products = [];
    
    // Try to fetch from backend API
    try {
      const response = await fetch('http://127.0.0.1:3000/api/products');
      if (response.ok) {
        const data = await response.json();
        products = Array.isArray(data) ? data : (data.products || []);
      } else {
        throw new Error('Backend failed');
      }
    } catch (e) {
      // Fallback to local demo storage if backend is unreachable
      if (typeof ensureDemoProducts === 'function') {
        products = ensureDemoProducts();
      }
    }

    if (!products || products.length === 0) {
      productsGrid.innerHTML = `
        <div class="col-span-full py-12 text-center text-slate-500">
          <p class="font-medium text-lg">No products available yet</p>
          <p class="text-sm">Check back later for our premium catalog.</p>
        </div>`;
      return;
    }

    productsGrid.innerHTML = products.slice(0, 8).map(product => {
      const price = typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0;
      const img = productImageSrc(product);
      const category = product.category || 'General';
      
      return `
        <article class="bg-white rounded-[24px] p-4 border border-slate-100 shadow-sm group flex flex-col">
          <div class="relative h-56 bg-slate-50 rounded-[16px] overflow-hidden mb-4">
            <img src="${img}" alt="${product.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <span class="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-slate-700 text-[10px] font-bold uppercase px-2.5 py-1 rounded-md shadow-sm">New</span>
          </div>
          <div class="px-2 flex-1 flex flex-col">
            <div class="flex justify-between items-center mb-1">
              <p class="text-[11px] text-slate-400 uppercase tracking-widest truncate w-24">${category}</p>
              <div class="flex text-amber-400 text-xs">★★★★★</div>
            </div>
            <h3 class="text-[17px] font-bold text-slate-900 line-clamp-1 mb-1">${product.name}</h3>
            <p class="text-[13px] text-slate-500 mb-6 line-clamp-2">${product.description || 'Premium workspace essential.'}</p>
            
            <div class="flex items-center justify-between mt-auto">
              <span class="text-xl font-bold text-slate-900">$${price.toFixed(2)}</span>
              <button onclick="openLoginModal()" class="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center hover:bg-[#B80024] transition-colors">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');

  } catch (error) {
    console.error('Failed to load landing products:', error);
    productsGrid.innerHTML = `
      <div class="col-span-full py-12 text-center text-slate-500">
        <p>Failed to load catalog.</p>
      </div>`;
  }
}

document.addEventListener('DOMContentLoaded', loadLandingProducts);

function handleContactSubmit(event) {
  event.preventDefault();
  const form = document.getElementById('contactForm');
  const successBox = document.getElementById('contactSuccess');
  if (!form || !successBox) return false;

  successBox.classList.remove('hidden');
  form.reset();

  setTimeout(() => {
    successBox.classList.add('hidden');
  }, 5000);

  return false;
}

window.handleContactSubmit = handleContactSubmit;
