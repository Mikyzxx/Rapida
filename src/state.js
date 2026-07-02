export const state = {
  products: [],
  cart: [],
  user: JSON.parse(sessionStorage.getItem('user')) || null,
  categories: [],
  
  // Helpers
  getCartSubtotal() {
    return this.cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  },
  
  getCartItemCount() {
    return this.cart.reduce((acc, item) => acc + item.quantity, 0);
  },

  updateCart(cartData) {
    this.cart = cartData;
    // Dispatch custom event to notify UI
    window.dispatchEvent(new CustomEvent('cart-updated'));
  },
  
  setUser(userData) {
    this.user = userData;
    if (userData) {
      sessionStorage.setItem('user', JSON.stringify(userData));
    } else {
      sessionStorage.removeItem('user');
    }
    window.dispatchEvent(new CustomEvent('user-updated'));
  },

  reduceStock(cartItems) {
    const localStock = JSON.parse(localStorage.getItem('wamazon_stock')) || {};
    cartItems.forEach(item => {
      const product = this.products.find(p => p.id === item.id);
      if (product && product.stock >= item.quantity) {
        product.stock -= item.quantity;
        localStock[product.id] = product.stock;
      }
    });
    localStorage.setItem('wamazon_stock', JSON.stringify(localStock));
    window.dispatchEvent(new CustomEvent('stock-updated'));
  }
};
