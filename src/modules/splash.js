import { api } from '../services/api.js';
import { state } from '../state.js';
import { initCatalog } from './catalog.js';

export const initSplash = async () => {
  const splashScreen = document.getElementById('splash-screen');
  const appContainer = document.getElementById('app-container');
  const splashLoader = document.getElementById('splash-loader');
  const splashMessage = document.getElementById('splash-message');
  const retryBtn = document.getElementById('retry-btn');

  // Asegurar mínimo 2 segundos de splash screen según requerimiento
  const delay = (ms) => new Promise(res => setTimeout(res, ms));

  const loadData = async () => {
    try {
      splashLoader.classList.remove('hidden');
      retryBtn.classList.add('hidden');
      splashMessage.textContent = 'Cargando delicias...';

      // Promise.all to fetch data and wait 2 seconds concurrently
      const [products] = await Promise.all([
        api.fetchProducts(),
        delay(2000)
      ]);

      // Leer stock guardado localmente si existe
      const localStock = JSON.parse(localStorage.getItem('wamazon_stock')) || {};

      // Guardar productos en estado
      // Usaremos el stock de localStorage, si no, rating.count o aleatorio
      state.products = products.map(p => ({
        ...p,
        stock: localStock[p.id] !== undefined ? localStock[p.id] : (p.rating ? p.rating.count : Math.floor(Math.random() * 50) + 1)
      }));

      // Extraer categorías únicas
      state.categories = [...new Set(products.map(p => p.category))];

      // Iniciar el catálogo
      initCatalog();

      // Transición al app
      splashScreen.style.opacity = '0';
      setTimeout(() => {
        splashScreen.classList.add('hidden');
        appContainer.classList.remove('hidden');
      }, 500); // 0.5s fade out

    } catch (error) {
      console.error('Error inicial:', error);
      splashLoader.classList.add('hidden');
      splashMessage.textContent = 'Ocurrió un error al cargar. Por favor, intenta de nuevo.';
      retryBtn.classList.remove('hidden');
    }
  };

  retryBtn.addEventListener('click', loadData);

  // Ejecutar carga automática al iniciar
  await loadData();
};
