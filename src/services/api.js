const FAKE_STORE_URL = 'https://fakestoreapi.com/products';
const DUMMY_JSON_URL = 'https://dummyjson.com';

export const api = {
  async fetchProducts() {
    const response = await fetch(FAKE_STORE_URL);
    if (!response.ok) throw new Error('Error al conectar con FakeStoreAPI');
    return await response.json();
  },

  async fetchUserByUsername(username) {
    // Buscar usuario en DummyJSON
    const response = await fetch(`${DUMMY_JSON_URL}/users/search?q=${username}`);
    if (!response.ok) throw new Error('Error de red al buscar usuario');
    const data = await response.json();
    
    // Validar coincidencia exacta (ya que search?q= busca en varios campos)
    const exactUser = data.users.find(u => u.username.toLowerCase() === username.toLowerCase());
    return exactUser || null;
  },

  async createCartOrder(userId, products) {
    // Usamos el endpoint de add cart de dummyjson
    const cartData = {
      userId: userId || 1, // dummyjson requiere un userId válido
      products: products.map(p => ({
        id: p.id,
        quantity: p.quantity
      }))
    };

    const response = await fetch(`${DUMMY_JSON_URL}/carts/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cartData)
    });

    if (!response.ok) throw new Error('Error al enviar el pedido');
    return await response.json();
  }
};
