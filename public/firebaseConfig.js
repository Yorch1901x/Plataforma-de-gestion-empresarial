// Firebase Configuration
// Este archivo contiene la configuración de Firebase
// Las variables se cargan desde el archivo .env

const firebaseConfig = {
    // Estas variables ahora deben cargarse desde el servidor para mayor seguridad.
    // Consulta /api/config o revisa el archivo .env en la raiz del proyecto.
    apiKey: "CARGADO_DESDE_ENV",
    authDomain: "CARGADO_DESDE_ENV",
    projectId: "CARGADO_DESDE_ENV",
    storageBucket: "CARGADO_DESDE_ENV",
    messagingSenderId: "CARGADO_DESDE_ENV",
    appId: "CARGADO_DESDE_ENV"
};


// Initialize Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Auth instance
export const auth = getAuth(app);
