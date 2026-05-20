const SERVER_URL = 'http://127.0.0.1:3000';
const API_BASE = `${SERVER_URL}/api`;

function getAuthToken() {
  return localStorage.getItem('kaabeToken');
}

function getUserRole() {
  return localStorage.getItem('kaabeRole');
}

/** Demo accounts when server is offline (must match seed.js) */
const DEMO_ACCOUNTS = [
  { username: 'admin', password: 'admin123', role: 'admin', fullName: 'System Admin' },
  { username: 'staff', password: 'staff123', role: 'staff', fullName: 'Staff Member' },
];

function validateDemoCredentials(username, password, selectedRole) {
  const normalizedUser = (username || '').trim().toLowerCase();
  const pass = password || '';

  if (!normalizedUser || !pass) {
    return { ok: false, error: 'Username and password are required.' };
  }

  let localUsers = [];
  try {
    localUsers = JSON.parse(localStorage.getItem('demo_users') || '[]');
  } catch (e) {
    console.error('Failed to parse demo_users from localStorage:', e);
  }

  const allAccounts = [...DEMO_ACCOUNTS, ...localUsers];

  const account = allAccounts.find(
    (entry) => (entry.username || '').trim().toLowerCase() === normalizedUser && entry.password === pass
  );

  if (!account) {
    return { ok: false, error: 'Invalid username or password.' };
  }

  if (selectedRole && account.role !== selectedRole) {
    const expected =
      account.role === 'admin' ? 'Admin Dashboard' : 'Staff Dashboard';
    return {
      ok: false,
      error: `Wrong login type. Select "${expected}" for this account.`,
    };
  }

  return { ok: true, account };
}

function setAuthData(token, role, fullName) {
  localStorage.setItem('kaabeToken', token);
  localStorage.setItem('kaabeRole', role);
  localStorage.setItem('kaabeFullName', fullName || 'User');
  localStorage.setItem('kaabeName', fullName || 'User');
}

function clearAuthData() {
  localStorage.removeItem('kaabeToken');
  localStorage.removeItem('kaabeRole');
  localStorage.removeItem('kaabeFullName');
  localStorage.removeItem('kaabeName');
}

async function apiFetch(endpoint, options = {}) {
  const token = getAuthToken();
  const isDemo = token && token.startsWith('demo-token-');

  if (isDemo) {
    console.warn(`Demo Mode: Intercepting ${options.method || 'GET'} ${endpoint}`);
    return handleDemoRequest(endpoint, options);
  }

  const headers = {
    ...options.headers,
  };
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      clearAuthData();
      window.location.href = 'login.html';
      return;
    }

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  } catch (error) {
    console.error('API Fetch Error:', error);
    // If network error and we have a token, maybe try demo mode fallback?
    // But for now, just throw the error
    throw error;
  }
}

function getDefaultDemoProducts() {
  return [
    {
      _id: 'demo-seed-pen',
      name: 'Executive Fountain Pen',
      price: 45,
      quantity: 120,
      category: 'Writing Instruments',
      description: 'Premium metal body for smooth writing and professional notes.',
      imageUrl: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=800&q=80',
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'demo-seed-journal',
      name: 'A5 Dot Grid Journal',
      price: 18.5,
      quantity: 84,
      category: 'Paper & Notebooks',
      description: '120gsm pages for smooth pen performance and clean layouts.',
      imageUrl: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=800&q=80',
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'demo-seed-organizer',
      name: 'Desk Organizer Kit',
      price: 24.99,
      quantity: 42,
      category: 'Desk Accessories',
      description: 'Modular organizer kit to keep your desk tidy and productive.',
      imageUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'demo-seed-highlighters',
      name: 'Premium Pastel Highlighters',
      price: 8.99,
      quantity: 150,
      category: 'Writing Instruments',
      description: 'Set of 6 aesthetic pastel colored chisel-tip highlighters.',
      imageUrl: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=800&q=80',
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'demo-seed-sticky',
      name: 'Sticky Notes Palette',
      price: 6.50,
      quantity: 200,
      category: 'Paper & Notebooks',
      description: 'Pack of 8 color-coordinated sticky note pads for planning.',
      imageUrl: 'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?auto=format&fit=crop&w=800&q=80',
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'demo-seed-clips',
      name: 'Vintage Brass Paper Clips',
      price: 4.99,
      quantity: 300,
      category: 'Desk Accessories',
      description: 'Premium quality solid brass clips to keep your files organized.',
      imageUrl: 'https://images.unsplash.com/photo-1616440347437-b1c73416efc2?auto=format&fit=crop&w=800&q=80',
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'demo-seed-gelpens',
      name: 'Aesthetic Gel Pens (10-pack)',
      price: 14.50,
      quantity: 110,
      category: 'Writing Instruments',
      description: 'Ultra-fine 0.5mm black ink gel pens with comfortable soft grip.',
      imageUrl: 'https://images.unsplash.com/photo-1585336139057-3c50a4b77e2a?auto=format&fit=crop&w=800&q=80',
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'demo-seed-case',
      name: 'Minimalist Leather Pencil Case',
      price: 19.99,
      quantity: 55,
      category: 'Desk Accessories',
      description: 'Genuine leather pencil pouch with smooth brass zipper.',
      imageUrl: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&w=800&q=80',
      createdAt: new Date().toISOString(),
    }
  ];
}

/** Shared catalog in demo mode — admin additions and staff sales use the same list */
function ensureDemoProducts() {
  const key = 'demo_products';
  let products = JSON.parse(localStorage.getItem(key) || '[]');
  if (!Array.isArray(products)) products = [];

  if (products.length === 0) {
    products = getDefaultDemoProducts();
    localStorage.setItem(key, JSON.stringify(products));
  }
  return products;
}

function recordDemoSale(product, quantity, totalAmount) {
  const sales = JSON.parse(localStorage.getItem('demo_sales') || '[]');
  sales.unshift({
    _id: 'demo-sale-' + Date.now(),
    productId: product._id,
    productName: product.name,
    quantity,
    unitPrice: product.price,
    totalAmount,
    soldBy: localStorage.getItem('kaabeFullName') || 'Staff',
    soldAt: new Date().toISOString(),
  });
  localStorage.setItem('demo_sales', JSON.stringify(sales));
}

// Simple local storage based mock backend for Demo Mode
function handleDemoRequest(endpoint, options) {
  const method = options.method || 'GET';
  const parts = endpoint.split('/').filter(Boolean);
  const resource = parts[0];
  const id = parts[1];

  let data =
    resource === 'products' ? ensureDemoProducts() : JSON.parse(localStorage.getItem(`demo_${resource}`) || '[]');

  if (method === 'GET') {
    if (resource === 'products') return ensureDemoProducts();
    if (resource === 'debts') {
      const summary = {
        totalAmount: data.reduce((s, d) => s + (d.totalAmount || 0), 0),
        totalPaid: data.reduce((s, d) => s + (d.amountPaid || 0), 0),
        outstanding: data.reduce((s, d) => s + ((d.totalAmount || 0) - (d.amountPaid || 0)), 0),
        debtCount: data.length,
        unpaidCount: data.filter(d => d.status !== 'Paid').length,
        debtorCount: new Set(data.map(d => d.customerName)).size
      };
      return { debts: data, summary };
    }
    if (resource === 'users') {
      if (data.length === 0) {
        data = [{ _id: 'demo-admin', username: 'admin', role: 'admin', fullName: 'Admin User' }];
        localStorage.setItem('demo_users', JSON.stringify(data));
      }
      return data;
    }
  }

  if (method === 'POST' && parts[2] === 'sell' && parts[0] === 'products') {
    const productId = parts[1];
    const body = options.body ? JSON.parse(options.body) : {};
    const quantity = parseInt(body.quantity, 10) || 1;
    const index = data.findIndex((item) => item._id === productId);
    if (index === -1) {
      throw new Error('Product not found');
    }
    if (data[index].quantity < quantity) {
      throw new Error('Not enough stock available');
    }
    data[index].quantity -= quantity;
    localStorage.setItem(`demo_${resource}`, JSON.stringify(data));
    const price =
      typeof data[index].price === 'number' ? data[index].price : parseFloat(data[index].price) || 0;
    const totalAmount = price * quantity;
    recordDemoSale(data[index], quantity, totalAmount);
    return {
      product: data[index],
      soldQuantity: quantity,
      totalAmount,
    };
  }

  if (method === 'POST') {
    let newItem;
    if (options.body instanceof FormData) {
      newItem = Object.fromEntries(options.body.entries());
      // Handle numeric fields
      if (newItem.price) newItem.price = parseFloat(newItem.price);
      if (newItem.quantity) newItem.quantity = parseInt(newItem.quantity, 10);
      
      // If there's a file, we can't easily store it in localStorage as a file
      // In a real app we'd use a FileReader, but here we'll just use the imageUrl if provided
      // OR if we wanted to be fancy, we could have the frontend pass a dataURL
    } else {
      newItem = JSON.parse(options.body);
    }
    newItem._id = 'demo-' + Date.now();
    newItem.createdAt = new Date().toISOString();
    data.push(newItem);
    localStorage.setItem(`demo_${resource}`, JSON.stringify(data));
    return newItem;
  }

  if (method === 'PUT' && id) {
    const index = data.findIndex(item => item._id === id);
    if (index !== -1) {
      let updates;
      if (options.body instanceof FormData) {
        updates = Object.fromEntries(options.body.entries());
        if (updates.price) updates.price = parseFloat(updates.price);
        if (updates.quantity) updates.quantity = parseInt(updates.quantity, 10);
      } else {
        updates = JSON.parse(options.body);
      }
      data[index] = { ...data[index], ...updates };
      localStorage.setItem(`demo_${resource}`, JSON.stringify(data));
      return data[index];
    }
  }

  if (method === 'DELETE' && id) {
    data = data.filter(item => item._id !== id);
    localStorage.setItem(`demo_${resource}`, JSON.stringify(data));
    return { success: true };
  }

  return null;
}

function protectRoute(allowedRoles = []) {
  const token = getAuthToken();
  const role = getUserRole();

  if (!token || !role) {
    window.location.href = 'login.html';
    return;
  }

  if (allowedRoles.length && !allowedRoles.includes(role)) {
    if (role === 'staff') {
      window.location.href = 'staff-dashboard.html';
    } else if (role === 'admin') {
      window.location.href = 'dashboard.html';
    } else {
      window.location.href = 'login.html';
    }
  }
}

function logout() {
  clearAuthData();
  window.location.href = 'login.html';
}

window.getAuthToken = getAuthToken;
window.getUserRole = getUserRole;
window.setAuthData = setAuthData;
window.clearAuthData = clearAuthData;
window.apiFetch = apiFetch;
window.protectRoute = protectRoute;
window.logout = logout;
window.ensureDemoProducts = ensureDemoProducts;
window.validateDemoCredentials = validateDemoCredentials;
window.SERVER_URL = SERVER_URL;
window.API_BASE = API_BASE;
