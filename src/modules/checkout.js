import { api } from '../services/api.js';
import { state } from '../state.js';

export const initCheckout = () => {
  const checkoutBtn = document.getElementById('checkout-btn');
  const cartSidebar = document.getElementById('cart-sidebar');
  const cartOverlay = document.getElementById('cart-overlay');
  
  const ticketModal = document.getElementById('ticket-modal');
  const ticketOverlay = document.getElementById('ticket-overlay');
  const checkoutLoader = document.getElementById('checkout-loader');
  const checkoutStatus = document.getElementById('checkout-status');
  const ticketResult = document.getElementById('ticket-result');
  const closeTicketBtn = document.getElementById('close-ticket-btn');

  // Funciones auxiliares para simular retardos y validar pasos
  const delay = (ms) => new Promise(res => setTimeout(res, ms));

  const validateConnection = async () => {
    checkoutStatus.textContent = 'Validando conexión...';
    await delay(800);
    if (!navigator.onLine) throw new Error('No hay conexión a internet.');
    return true;
  };

  const validateInventory = async () => {
    checkoutStatus.textContent = 'Validando inventario...';
    await delay(1000);
    // Simular que pedimos el stock fresco
    const productsInCart = state.cart;
    for (const item of productsInCart) {
      // Find original product to check stock
      const originalProduct = state.products.find(p => p.id === item.id);
      if (!originalProduct || originalProduct.stock < item.quantity) {
        throw new Error(`Stock insuficiente para ${item.title}`);
      }
    }
    return true;
  };

  const calculateTotal = async () => {
    checkoutStatus.textContent = 'Calculando totales...';
    await delay(600);
    const subtotal = state.getCartSubtotal();
    const tax = subtotal * 0.16;
    return subtotal + tax;
  };

  const sendOrder = async () => {
    checkoutStatus.textContent = 'Enviando pedido al servidor...';
    await delay(1000);
    
    // Usamos el API de dummyjson para guardar el carrito (requiere userId, si no hay pasamos 1)
    const userId = state.user ? state.user.id : 1;
    const result = await api.createCartOrder(userId, state.cart);
    return result; // DummyJson returns the created cart id
  };

  const savePurchase = async (orderData, finalTotal) => {
    checkoutStatus.textContent = 'Guardando compra...';
    await delay(500);
    const orderRecord = {
      id: orderData.id || `ORD-${Math.floor(Math.random() * 10000)}`,
      date: new Date().toISOString(),
      items: [...state.cart],
      total: finalTotal,
      userId: state.user ? state.user.id : 'Guest'
    };
    
    const history = JSON.parse(localStorage.getItem('purchaseHistory') || '[]');
    history.push(orderRecord);
    localStorage.setItem('purchaseHistory', JSON.stringify(history));
    
    return orderRecord;
  };

  const showTicket = (orderRecord) => {
    checkoutLoader.classList.add('hidden');
    ticketResult.classList.remove('hidden');

    document.getElementById('ticket-order-id').textContent = orderRecord.id;
    document.getElementById('ticket-user').textContent = state.user ? `${state.user.firstName} ${state.user.lastName}` : 'Invitado';
    
    const ticketItemsContainer = document.getElementById('ticket-items');
    ticketItemsContainer.innerHTML = '';
    orderRecord.items.forEach(item => {
      const el = document.createElement('div');
      el.className = 'ticket-item';
      el.innerHTML = `<span>${item.quantity}x ${item.title}</span> <span>$${(item.price * item.quantity).toFixed(2)}</span>`;
      ticketItemsContainer.appendChild(el);
    });

    document.getElementById('ticket-total-amount').textContent = `$${orderRecord.total.toFixed(2)}`;
  };

  // Flujo principal de Checkout
  checkoutBtn.addEventListener('click', async () => {
    if (state.cart.length === 0) return;
    
    // Opcional: Requerir login antes de comprar
    if (!state.user) {
      alert('Por favor, inicia sesión para finalizar tu compra.');
      document.getElementById('login-btn').click();
      return;
    }

    // Cerrar carrito y abrir modal de ticket en modo carga
    cartSidebar.classList.add('hidden');
    cartOverlay.classList.add('hidden');
    
    ticketModal.classList.remove('hidden');
    ticketOverlay.classList.remove('hidden');
    checkoutLoader.classList.remove('hidden');
    ticketResult.classList.add('hidden');

    try {
      await validateConnection();
      await validateInventory();
      const finalTotal = await calculateTotal();
      const orderData = await sendOrder();
      const orderRecord = await savePurchase(orderData, finalTotal);
      
      showTicket(orderRecord);
      
      // Vaciar carrito después de compra exitosa
      state.updateCart([]);
      
    } catch (error) {
      console.error(error);
      checkoutLoader.classList.add('hidden');
      alert(`Error en Checkout: ${error.message}`);
      ticketModal.classList.add('hidden');
      ticketOverlay.classList.add('hidden');
      // Re-abrir carrito
      cartSidebar.classList.remove('hidden');
      cartOverlay.classList.remove('hidden');
    }
  });

  closeTicketBtn.addEventListener('click', () => {
    ticketModal.classList.add('hidden');
    ticketOverlay.classList.add('hidden');
  });
};
