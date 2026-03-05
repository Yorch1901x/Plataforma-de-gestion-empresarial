// Import Firebase modules
import { signOut } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

// Obtener configuración de Firebase desde el servidor
let firebaseConfig = null;
let auth = null;
let db = null;

async function initializeFirebase() {
    try {
        const response = await fetch('/api/config');
        const data = await response.json();
        firebaseConfig = data.firebaseConfig;

        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);

        console.log('Firebase inicializado correctamente');
    } catch (error) {
        console.error('Error al obtener configuración de Firebase:', error);
    }
}

// Inicializar Firebase antes de hacer nada
await initializeFirebase();

// Verificar si el usuario está autenticado
const userEmail = localStorage.getItem('userEmail');
const authToken = localStorage.getItem('authToken');

console.log('Verificando autenticación en dashboard...');
console.log('Email guardado:', userEmail);
console.log('Token guardado:', authToken ? 'Sí' : 'No');

if (!userEmail || !authToken) {
    console.log('No autenticado, redirigiendo a login');
    window.location.href = '/login';
} else {
    console.log('Usuario autenticado:', userEmail);
    // Mostrar email del usuario
    const userNameElement = document.getElementById('userEmail');
    if (userNameElement) {
        userNameElement.textContent = userEmail;
    }
    const welcomeMessage = document.getElementById('welcomeMessage');
    if (welcomeMessage) {
        welcomeMessage.textContent = `¡Hola ${userEmail}! Tu sesión está activa.`;
    }

    // Verificar el rol del usuario en Firestore para mostrar opciones de Owner
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            try {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    if (userData.role === 'owner') {
                        const navLinks = document.getElementById('navLinks');
                        const ownerLink = document.createElement('li');
                        ownerLink.innerHTML = '<a href="/owner-panel" style="color:#f59e0b; font-weight:bold;">Panel Owner 👑</a>';
                        navLinks.appendChild(ownerLink);
                    }
                }
            } catch (error) {
                console.error("Error al obtener perfil del usuario", error);
            }
        }
    });
}

// Logout
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        try {
            await signOut(auth);
            localStorage.removeItem('authToken');
            localStorage.removeItem('userEmail');
            console.log('Sesión cerrada');
            window.location.href = '/login';
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    });
}
