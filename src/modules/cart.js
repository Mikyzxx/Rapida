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

  const cardName = document.getElementById('card-name');
  const cardNumber = document.getElementById('card-number');
  const cardExpiry = document.getElementById('card-expiry');
  const cardCvc = document.getElementById('card-cvc');
  
  [cardName, cardNumber, cardExpiry, cardCvc].forEach(input => {
    input.addEventListener('input', validatePayment);
  });

  window.addEventListener('cart-updated', renderCart);
  
  // Initial render
  renderCart();
};

export const validatePayment = () => {
  const checkoutBtn = document.getElementById('checkout-btn');
  const cardName = document.getElementById('card-name');
  const cardNumber = document.getElementById('card-number');
  const cardExpiry = document.getElementById('card-expiry');
  const cardCvc = document.getElementById('card-cvc');
  
  if (state.cart.length === 0) {
    checkoutBtn.disabled = true;
    return;
  }
  
  // Validar nombre (máximo 50 ya lo hace el HTML, pero verificamos longitud)
  const nameVal = cardName.value.trim();
  const nameValid = nameVal.length > 0 && nameVal.length <= 50;

  // Validar y limpiar número (solo dígitos, 16)
  const numVal = cardNumber.value.replace(/\D/g, '').substring(0, 16);
  if (cardNumber.value !== numVal) cardNumber.value = numVal;
  const numValid = numVal.length === 16;

  // Validar y formatear expiración (MM/AA)
  let expVal = cardExpiry.value.replace(/\D/g, '');
  if (expVal.length > 2) {
    expVal = expVal.substring(0, 2) + '/' + expVal.substring(2, 4);
  }
  if (cardExpiry.value !== expVal) cardExpiry.value = expVal;
  
  let expValid = false;
  if (expVal.length === 5) {
    const [month, year] = expVal.split('/');
    const m = parseInt(month, 10);
    const y = parseInt(year, 10);
    if (m >= 1 && m <= 12 && y >= 15 && y <= 50) {
      expValid = true;
    }
  }

  // Validar CVC (solo dígitos, 3-4)
  const cvcVal = cardCvc.value.replace(/\D/g, '').substring(0, 4);
  if (cardCvc.value !== cvcVal) cardCvc.value = cvcVal;
  const cvcValid = cvcVal.length >= 3;

  checkoutBtn.disabled = !(nameValid && numValid && expValid && cvcValid);
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
    document.getElementById('payment-section').classList.add('hidden');
  } else {
    document.getElementById('payment-section').classList.remove('hidden');
    validatePayment();
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
