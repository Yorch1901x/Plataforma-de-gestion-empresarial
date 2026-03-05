// Import Firebase modules
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

// Obtener configuración de Firebase desde el servidor
let firebaseConfig = null;
let auth = null;

async function initializeFirebase() {
    try {
        const response = await fetch('/api/config');
        const data = await response.json();
        firebaseConfig = data.firebaseConfig;

        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        auth = getAuth(app);

        console.log('Firebase inicializado correctamente');
    } catch (error) {
        console.error('Error al obtener configuración de Firebase:', error);
    }
}

// Inicializar Firebase antes de hacer nada
await initializeFirebase();

const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const toggleBtn = document.getElementById('toggleBtn');
const errorBox = document.getElementById('errorBox');
const submitBtn = document.getElementById('submitBtn');

// Lógica para mostrar/ocultar contraseña
toggleBtn.addEventListener('click', () => {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    toggleBtn.textContent = isPassword ? 'Ocultar' : 'Ver';
});

// Manejo del envío del formulario con Firebase
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    submitBtn.disabled = true;
    submitBtn.textContent = 'AUTENTICANDO...';
    errorBox.style.display = 'none';

    const email = emailInput.value;
    const password = passwordInput.value;

    console.log('Intentando autenticar con email:', email);

    try {
        // Autenticar con Firebase
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        console.log('Autenticación exitosa:', user.email);

        // Obtener token de autenticación
        const token = await user.getIdToken();

        console.log('Token obtenido');

        // Guardar token en localStorage
        localStorage.setItem('authToken', token);
        localStorage.setItem('userEmail', user.email);

        console.log('Token guardado en localStorage');

        // Redirigir al dashboard
        console.log('Redirigiendo a /dashboard');
        window.location.href = '/dashboard';
    } catch (error) {
        console.error('Error de autenticación:', error.code, error.message);

        // Manejo de errores de Firebase
        let errorMessage = 'Acceso Denegado';

        switch (error.code) {
            case 'auth/user-not-found':
                errorMessage = 'Usuario no encontrado';
                break;
            case 'auth/wrong-password':
                errorMessage = 'Contraseña incorrecta';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Email inválido';
                break;
            case 'auth/too-many-requests':
                errorMessage = 'Demasiados intentos. Intenta más tarde';
                break;
            default:
                errorMessage = error.message || 'Error al iniciar sesión';
        }

        errorBox.textContent = errorMessage;
        errorBox.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Ingresar';
        passwordInput.value = '';
    }
});

// Limpiar error al escribir
[emailInput, passwordInput].forEach(input => {
    input.addEventListener('input', () => {
        errorBox.style.display = 'none';
    });
});
