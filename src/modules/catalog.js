import { state } from '../state.js';
import { addToCart } from './cart.js';

export const initCatalog = () => {
  const catalogGrid = document.getElementById('catalog');
  const searchInput = document.getElementById('search-input');
  const categoryFilter = document.getElementById('category-filter');
  const sortSelect = document.getElementById('sort-select');

  // Populate categories
  state.categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    categoryFilter.appendChild(option);
  });

  const renderProducts = (products) => {
    catalogGrid.innerHTML = '';
    
    if (products.length === 0) {
      catalogGrid.innerHTML = '<p style="grid-column: 1/-1; text-align:center;">No se encontraron productos.</p>';
      return;
    }

    products.forEach(product => {
      const card = document.createElement('article');
      card.className = 'product-card';
      card.innerHTML = `
        <div class="product-img-wrapper">
          <img src="${product.image}" alt="${product.title}" loading="lazy" />
        </div>
        <span class="product-category">${product.category}</span>
        <h3 class="product-title" title="${product.title}">${product.title}</h3>
        <div class="product-meta">
          <span title="Rating">⭐ ${product.rating?.rate || '0.0'}</span>
          <span title="Stock disponible">📦 Stock: ${product.stock}</span>
        </div>
        <div class="product-price">$${product.price.toFixed(2)}</div>
        <button class="btn-primary add-to-cart-btn" data-id="${product.id}">
          Agregar al Carrito
        </button>
      `;
      catalogGrid.appendChild(card);
    });

    // Add event listeners for "Add to Cart"
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.getAttribute('data-id'));
        addToCart(id);
      });
    });
  };

  const updateCatalog = () => {
    const query = searchInput.value.toLowerCase();
    const category = categoryFilter.value;
    const sort = sortSelect.value;

    let filtered = state.products.filter(p => {
      const matchName = p.title.toLowerCase().includes(query);
      const matchCat = category === 'all' || p.category === category;
      return matchName && matchCat;
    });

    switch (sort) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'name-desc':
        filtered.sort((a, b) => b.title.localeCompare(a.title));
        break;
      default:
        // relevance or default order (by ID)
        filtered.sort((a, b) => a.id - b.id);
        break;
    }

    renderProducts(filtered);
  };

  searchInput.addEventListener('input', updateCatalog);
  categoryFilter.addEventListener('change', updateCatalog);
  sortSelect.addEventListener('change', updateCatalog);

  // Initial render
  renderProducts(state.products);
};
