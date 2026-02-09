// products.js — simple client-side CRUD using localStorage
(function () {
  const STORAGE_KEY = 'organic_products_v1';

  // Helpers
  function $(sel) { return document.querySelector(sel); }
  function $all(sel) { return Array.from(document.querySelectorAll(sel)); }

  // Modal
  const productModalEl = document.getElementById('productModal');
  const productModal = productModalEl ? new bootstrap.Modal(productModalEl) : null;

  // Form fields
  const productForm = document.getElementById('productForm');
  const productId = document.getElementById('productId');
  const productName = document.getElementById('productName');
  const productPrice = document.getElementById('productPrice');
  const productCategory = document.getElementById('productCategory');
  const productImage = document.getElementById('productImage');
  const productRating = document.getElementById('productRating');
  const productDescription = document.getElementById('productDescription');

  const addProductBtn = document.getElementById('addProductBtn');
  const saveProductBtn = document.getElementById('saveProductBtn');
  const productsGrid = document.getElementById('productsGrid');
  const searchInput = document.getElementById('searchProduct');
  const sortSelect = document.getElementById('sortProducts');

  // Seed data for first run
  const seed = [
    { id: uid(), name: 'Organic Spinach', price: 80, category: 'vegetables', image: 'https://images.unsplash.com/photo-1524594154900-7d4b9d3f8c61?auto=format&fit=crop&w=800&q=60', rating: 4.5, desc: 'Fresh leafy spinach.' },
    { id: uid(), name: 'Red Apples', price: 150, category: 'fruits', image: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=800&q=60', rating: 4.7, desc: 'Crisp and sweet.' }
  ];

  // --- storage ---
  function getProducts() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return seed.slice();
      return JSON.parse(raw);
    } catch (e) {
      console.error('Failed to parse products', e);
      return seed.slice();
    }
  }

  function saveProducts(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  // --- utilities ---
  function uid() {
    return 'p_' + Math.random().toString(36).slice(2, 9);
  }

  function currency(n) {
    return '₹' + Number(n).toLocaleString();
  }

  // --- render ---
  function renderProducts() {
    const list = getProducts();
    const q = (searchInput?.value || '').trim().toLowerCase();
    let filtered = list.filter(p => p.name.toLowerCase().includes(q) || (p.category||'').toLowerCase().includes(q));

    const sort = sortSelect?.value;
    if (sort === 'price-low') filtered.sort((a,b)=>a.price-b.price);
    if (sort === 'price-high') filtered.sort((a,b)=>b.price-a.price);
    if (sort === 'rating') filtered.sort((a,b)=>b.rating-a.rating);
    if (sort === 'newest') filtered.sort((a,b)=> (b._created||0) - (a._created||0));

    productsGrid.innerHTML = '';
    if (!filtered.length) {
      productsGrid.innerHTML = '<div class="col-12"><div class="alert alert-info">No products found.</div></div>';
      return;
    }

    filtered.forEach(p => {
      const col = document.createElement('div');
      col.className = 'col-sm-6 col-lg-4';
      col.innerHTML = `
        <div class="card product-card h-100 position-relative">
          <img src="${p.image||'https://via.placeholder.com/800x600?text=No+Image'}" class="product-image" alt="${escapeHtml(p.name)}" />
          <div class="product-info">
            <h5 class="mb-1">${escapeHtml(p.name)}</h5>
            <div class="d-flex justify-content-between align-items-center mb-2">
              <div class="product-price">${currency(p.price)}</div>
              <div class="rating"><i class="fas fa-star"></i> ${p.rating||0}</div>
            </div>
            <p class="text-muted small">${escapeHtml(p.desc||p.description||'')}</p>
            <div class="d-flex justify-content-between align-items-center">
              <button class="btn btn-outline-success btn-sm add-to-cart" data-id="${p.id}"><i class="fas fa-cart-plus"></i> Add</button>
              <div>
                <button class="btn btn-sm btn-light me-1 edit-product" data-id="${p.id}"><i class="fas fa-edit text-primary"></i></button>
                <button class="btn btn-sm btn-light delete-product" data-id="${p.id}"><i class="fas fa-trash text-danger"></i></button>
              </div>
            </div>
          </div>
        </div>
      `;
      productsGrid.appendChild(col);
    });

    // attach edit/delete listeners
    $all('.edit-product').forEach(btn => btn.addEventListener('click', e => openEditModal(e.target.closest('[data-id]')?.dataset.id || btn.dataset.id)));
    $all('.delete-product').forEach(btn => btn.addEventListener('click', e => deleteProduct(btn.dataset.id)));
  }

  function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;" })[c]); }

  // --- CRUD actions ---
  function openAddModal() {
    productForm.reset();
    productId.value = '';
    productModalEl.querySelector('.modal-title').textContent = 'Add Product';
    productModal.show();
  }

  function openEditModal(id) {
    const list = getProducts();
    const p = list.find(x=>x.id===id);
    if (!p) return alert('Product not found');
    productId.value = p.id;
    productName.value = p.name;
    productPrice.value = p.price;
    productCategory.value = p.category;
    productImage.value = p.image;
    productRating.value = p.rating;
    productDescription.value = p.desc || p.description || '';
    productModalEl.querySelector('.modal-title').textContent = 'Edit Product';
    productModal.show();
  }

  function deleteProduct(id) {
    if (!confirm('Delete this product?')) return;
    const list = getProducts().filter(p=>p.id!==id);
    saveProducts(list);
    renderProducts();
  }

  function handleSave() {
    if (!productForm.reportValidity()) return;
    const list = getProducts();
    const id = productId.value || uid();
    const item = {
      id,
      name: productName.value.trim(),
      price: Number(productPrice.value) || 0,
      category: productCategory.value.trim(),
      image: productImage.value.trim(),
      rating: Number(productRating.value) || 0,
      desc: productDescription.value.trim(),
      _created: Date.now()
    };

    const exists = list.findIndex(p=>p.id===id);
    if (exists >= 0) list[exists] = Object.assign({}, list[exists], item);
    else list.unshift(item);

    saveProducts(list);
    productModal.hide();
    renderProducts();
  }

  // --- interactions ---
  function attachEvents(){
    addProductBtn?.addEventListener('click', openAddModal);
    saveProductBtn?.addEventListener('click', handleSave);
    searchInput?.addEventListener('input', debounce(renderProducts, 250));
    sortSelect?.addEventListener('change', renderProducts);
  }

  function debounce(fn, wait){ let t; return (...a)=>{ clearTimeout(t); t = setTimeout(()=>fn(...a), wait); }; }

  // Initialize
  function init(){
    attachEvents();
    renderProducts();
  }

  // expose for console (dev) and run
  window.OrganicProducts = { getProducts, saveProducts, renderProducts };
  document.addEventListener('DOMContentLoaded', init);

})();
