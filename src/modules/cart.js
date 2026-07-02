import { state } from '../state.js';

export const initCart = () => {
  const cartToggleBtn = document.getElementById('cart-toggle-btn');
  const closeCartBtn = document.getElementById('close-cart-btn');
  const cartSidebar = document.getElementById('cart-sidebar');
  const cartOverlay = document.getElementById('cart-overlay');
  const emptyCartBtn = document.getElementById('empty-cart-btn');

  const toggleCart = () => {
    const isHidden = cartSidebar.classList.contains('hidden');
    if (isHidden) {
      cartSidebar.classList.remove('hidden');
      cartOverlay.classList.remove('hidden');
    } else {
      cartSidebar.classList.add('hidden');
      cartOverlay.classList.add('hidden');
    }
  };

  cartToggleBtn.addEventListener('click', toggleCart);
  closeCartBtn.addEventListener('click', toggleCart);
  cartOverlay.addEventListener('click', toggleCart);

  emptyCartBtn.addEventListener('click', () => {
    state.updateCart([]);
  });

  window.addEventListener('cart-updated', renderCart);
  
  // Initial render
  renderCart();
};

export const addToCart = (productId) => {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;

  const currentCart = [...state.cart];
  const existingItem = currentCart.find(item => item.id === productId);

  if (existingItem) {
    if (existingItem.quantity < product.stock) {
      existingItem.quantity += 1;
    } else {
      alert('¡Stock máximo alcanzado!');
      return;
    }
  } else {
    if (product.stock > 0) {
      currentCart.push({ ...product, quantity: 1 });
    } else {
      alert('Producto sin stock');
      return;
    }
  }

  state.updateCart(currentCart);
};

export const updateQuantity = (productId, delta) => {
  let currentCart = [...state.cart];
  const itemIndex = currentCart.findIndex(item => item.id === productId);
  
  if (itemIndex > -1) {
    const item = currentCart[itemIndex];
    const product = state.products.find(p => p.id === productId);
    
    const newQty = item.quantity + delta;
    if (newQty > 0 && newQty <= product.stock) {
      item.quantity = newQty;
    } else if (newQty <= 0) {
      currentCart.splice(itemIndex, 1);
    } else {
      alert('¡Stock máximo alcanzado!');
      return;
    }
    state.updateCart(currentCart);
  }
};

const renderCart = () => {
  const cartItemsContainer = document.getElementById('cart-items');
  const cartBadge = document.getElementById('cart-badge');
  const cartSubtotalEl = document.getElementById('cart-subtotal');
  const cartTaxEl = document.getElementById('cart-tax');
  const cartTotalEl = document.getElementById('cart-total');
  const checkoutBtn = document.getElementById('checkout-btn');

  // Update Badge
  cartBadge.textContent = state.getCartItemCount();

  // Render Items
  cartItemsContainer.innerHTML = '';
  if (state.cart.length === 0) {
    cartItemsContainer.innerHTML = '<p style="text-align:center; color: var(--text-muted);">El carrito está vacío</p>';
    checkoutBtn.disabled = true;
  } else {
    checkoutBtn.disabled = false;
    state.cart.forEach(item => {
      const itemEl = document.createElement('div');
      itemEl.className = 'cart-item';
      itemEl.innerHTML = `
        <img src="${item.image}" alt="${item.title}" />
        <div class="cart-item-details">
          <div class="cart-item-title" title="${item.title}">${item.title}</div>
          <div class="cart-item-price">$${item.price.toFixed(2)} x ${item.quantity}</div>
        </div>
        <div class="cart-item-actions">
          <button class="qty-btn dec-btn" data-id="${item.id}">-</button>
          <span>${item.quantity}</span>
          <button class="qty-btn inc-btn" data-id="${item.id}">+</button>
        </div>
      `;
      cartItemsContainer.appendChild(itemEl);
    });
  }

  // Calculate totals
  const subtotal = state.getCartSubtotal();
  const tax = subtotal * 0.16; // 16% IVA
  const total = subtotal + tax;

  cartSubtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  cartTaxEl.textContent = `$${tax.toFixed(2)}`;
  cartTotalEl.textContent = `$${total.toFixed(2)}`;

  // Bind qty buttons
  document.querySelectorAll('.dec-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(e.target.getAttribute('data-id'));
      updateQuantity(id, -1);
    });
  });
  document.querySelectorAll('.inc-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(e.target.getAttribute('data-id'));
      updateQuantity(id, 1);
    });
  });
};
