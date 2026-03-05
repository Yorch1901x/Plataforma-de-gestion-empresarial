import { createUserWithEmailAndPassword, getAuth } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getFirestore, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

// Obtener configuración de Firebase desde el servidor
let firebaseConfig = null;
let auth = null;
let db = null;

async function initializeFirebase() {
    try {
        const response = await fetch('/api/config');
        const data = await response.json();
        firebaseConfig = data.firebaseConfig;

        if (!firebaseConfig.apiKey || firebaseConfig.apiKey === '""') {
            throw new Error("No has configurado las llaves de Firebase en el archivo .env");
        }

        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);

        console.log('Firebase inicializado correctamente');
    } catch (error) {
        console.error('Error al obtener configuración de Firebase:', error);
        alert("Error crítico: " + error.message + ". Verifica tu consola/servidor.");
    }
}

// Inicializar Firebase antes de hacer nada
await initializeFirebase();

const signupForm = document.getElementById('signupForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');
const toggleBtn = document.getElementById('toggleBtn');
const toggleConfirmBtn = document.getElementById('toggleConfirmBtn');
const errorBox = document.getElementById('errorBox');
const successBox = document.getElementById('successBox');
const submitBtn = document.getElementById('submitBtn');
const passwordRequirements = document.getElementById('passwordRequirements');

// Validar requisitos de contraseña
passwordInput.addEventListener('input', () => {
    const password = passwordInput.value;
    if (password.length >= 6) {
        passwordRequirements.classList.add('valid');
        passwordRequirements.textContent = '✓ Contraseña válida';
    } else {
        passwordRequirements.classList.remove('valid');
        passwordRequirements.textContent = '✗ Mínimo 6 caracteres';
    }
    errorBox.style.display = 'none';
});

// Lógica para mostrar/ocultar contraseña
toggleBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    toggleBtn.textContent = isPassword ? 'Ocultar' : 'Ver';
});

toggleConfirmBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const isPassword = confirmPasswordInput.type === 'password';
    confirmPasswordInput.type = isPassword ? 'text' : 'password';
    toggleConfirmBtn.textContent = isPassword ? 'Ocultar' : 'Ver';
});

// Manejo del envío del formulario con Firebase
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = emailInput.value;
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    console.log('Intentando registrar usuario con email:', email);

    errorBox.style.display = 'none';
    successBox.style.display = 'none';

    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
        errorBox.textContent = 'Las contraseñas no coinciden';
        errorBox.style.display = 'block';
        return;
    }

    // Validar longitud mínima
    if (password.length < 6) {
        errorBox.textContent = 'La contraseña debe tener al menos 6 caracteres';
        errorBox.style.display = 'block';
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'CREANDO CUENTA...';

    try {
        console.log('Llamando a createUserWithEmailAndPassword...');

        // Crear usuario con Firebase
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        console.log('Usuario creado exitosamente en Auth:', user.uid, user.email);

        // Crear su perfil inicial en Firestore usando su UID como Document ID
        const userRef = doc(db, "users", user.uid);

        const userPayload = {
            uid: user.uid,
            email: user.email,
            role: "user",      // Estricto: todos inician como 'user'
            orgs_ids: [],      // Inicia sin organizaciones
            createdAt: serverTimestamp()
        };

        console.log('Intentando guardar en Firestore el siguiente payload:', userPayload);

        try {
            // Usamos setDoc para fijar la estructura base y el rol bloqueado.
            await setDoc(userRef, userPayload);
            console.log('Registro en Firestore completado con éxito.');
        } catch (firestoreError) {
            console.error('ERROR CRÍTICO AL GUARDAR EN FIRESTORE:', firestoreError);
            alert('La cuenta se creó, pero falló el registro en base de datos: ' + firestoreError.message);
            throw firestoreError; // Relanzamos para abortar flujo
        }

        // Guardar token en localStorage
        const token = await user.getIdToken();
        localStorage.setItem('authToken', token);
        localStorage.setItem('userEmail', user.email);

        // Mostrar mensaje de éxito
        successBox.textContent = '¡Cuenta creada exitosamente! Redirigiendo...';
        successBox.style.display = 'block';

        // Redirigir después de 2 segundos al dashboard
        setTimeout(() => {
            window.location.href = '/dashboard';
        }, 2000);
    } catch (error) {
        console.error('Error al crear usuario:', error.code, error.message);

        // Manejo de errores de Firebase
        let errorMessage = 'Error al crear la cuenta';

        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMessage = 'Este email ya está registrado';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Email inválido';
                break;
            case 'auth/weak-password':
                errorMessage = 'La contraseña es muy débil';
                break;
            case 'auth/operation-not-allowed':
                errorMessage = 'El registro está deshabilitado en Firebase Console';
                break;
            default:
                errorMessage = error.message;
        }

        console.error('Mensaje de error:', errorMessage);
        errorBox.textContent = errorMessage;
        errorBox.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Crear Cuenta';
    }
});
