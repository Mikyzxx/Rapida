import { api } from '../services/api.js';
import { state } from '../state.js';

export const initAuth = () => {
  const loginBtn = document.getElementById('login-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const userDisplay = document.getElementById('user-display');
  
  const loginModal = document.getElementById('login-modal');
  const loginOverlay = document.getElementById('login-overlay');
  const closeLoginBtn = document.getElementById('close-login-btn');
  const loginForm = document.getElementById('login-form');
  const usernameInput = document.getElementById('username-input');
  const passwordInput = document.getElementById('password-input');
  const loginError = document.getElementById('login-error');
  const submitLoginBtn = document.getElementById('submit-login-btn');

  const toggleModal = (show) => {
    if (show) {
      loginModal.classList.remove('hidden');
      loginOverlay.classList.remove('hidden');
      usernameInput.focus();
    } else {
      loginModal.classList.add('hidden');
      loginOverlay.classList.add('hidden');
      loginError.classList.add('hidden');
      loginForm.reset();
    }
  };

  loginBtn.addEventListener('click', () => toggleModal(true));
  closeLoginBtn.addEventListener('click', () => toggleModal(false));
  loginOverlay.addEventListener('click', () => toggleModal(false));

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    if (!username || !password) return;

    try {
      submitLoginBtn.disabled = true;
      submitLoginBtn.textContent = 'Verificando...';
      loginError.classList.add('hidden');

      const user = await api.fetchUserByUsername(username);
      
      if (user && user.password === password) {
        state.setUser(user);
        toggleModal(false);
      } else {
        loginError.textContent = 'Usuario o contraseña incorrectos.';
        loginError.classList.remove('hidden');
      }
    } catch (error) {
      console.error(error);
      loginError.textContent = 'Error de conexión. Intente de nuevo.';
      loginError.classList.remove('hidden');
    } finally {
      submitLoginBtn.disabled = false;
      submitLoginBtn.textContent = 'Ingresar';
    }
  });

  logoutBtn.addEventListener('click', () => {
    state.setUser(null);
  });

  // Listen to state changes
  window.addEventListener('user-updated', updateAuthUI);
  
  // Initial check
  updateAuthUI();
};

const updateAuthUI = () => {
  const loginBtn = document.getElementById('login-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const userDisplay = document.getElementById('user-display');

  if (state.user) {
    loginBtn.classList.add('hidden');
    logoutBtn.classList.remove('hidden');
    userDisplay.classList.remove('hidden');
    userDisplay.textContent = `Hola, ${state.user.firstName}`;
  } else {
    loginBtn.classList.remove('hidden');
    logoutBtn.classList.add('hidden');
    userDisplay.classList.add('hidden');
    userDisplay.textContent = '';
  }
};
