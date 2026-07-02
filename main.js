import './style.css';
import { initSplash } from './src/modules/splash.js';
import { initCart } from './src/modules/cart.js';
import { initAuth } from './src/modules/auth.js';
import { initCheckout } from './src/modules/checkout.js';

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', () => {
  // Inicializamos los módulos de UI y lógica que no dependen de la carga asíncrona
  initCart();
  initAuth();
  initCheckout();

  // Iniciamos el flujo principal (Splash Screen -> Fetch Products -> Render Catalog)
  initSplash();
});
