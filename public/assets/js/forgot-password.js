// Import Firebase modules
import { sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
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

const resetForm = document.getElementById('resetForm');
const emailInput = document.getElementById('email');
const errorBox = document.getElementById('errorBox');
const successBox = document.getElementById('successBox');
const infoText = document.getElementById('infoText');
const submitBtn = document.getElementById('submitBtn');

// Manejo del envío del formulario
resetForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = emailInput.value;

    errorBox.style.display = 'none';
    successBox.style.display = 'none';

    submitBtn.disabled = true;
    submitBtn.textContent = 'ENVIANDO...';

    try {
        // Enviar email de recuperación con Firebase
        await sendPasswordResetEmail(auth, email);

        // Mostrar mensaje de éxito
        infoText.style.display = 'none';
        successBox.textContent = '¡Correo enviado! Revisa tu bandeja de entrada.';
        successBox.style.display = 'block';

        // Limpiar formulario
        resetForm.reset();

        // Ocultar botón de envío
        submitBtn.style.display = 'none';

        // Mostrar enlace de volver después de 5 segundos
        setTimeout(() => {
            resetForm.style.display = 'none';
        }, 5000);
    } catch (error) {
        // Manejo de errores de Firebase
        let errorMessage = 'Error al enviar el correo';

        switch (error.code) {
            case 'auth/user-not-found':
                errorMessage = 'No existe una cuenta con este correo';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Correo electrónico inválido';
                break;
            case 'auth/too-many-requests':
                errorMessage = 'Demasiados intentos. Intenta más tarde';
                break;
            default:
                errorMessage = error.message;
        }

        errorBox.textContent = errorMessage;
        errorBox.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Enviar Enlace de Recuperación';
    }
});

// Limpiar error al escribir
emailInput.addEventListener('input', () => {
    errorBox.style.display = 'none';
});
