// Servidor Node.js con Express y autenticación (versión simplificada)
const express = require('express');
const path = require('path');
const bcryptjs = require('bcryptjs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Almacenar sesiones en memoria (en producción usar base de datos)
const sessions = {};

// Datos simulados de usuarios
const users = [
    { id: 1, email: 'user@example.com', password: '$2a$10$YIvxPD8H2lBYaYM9C8q7m.8xsKE9e8DKfI2s5Zy1qZ7P5Qc2J6t8m' }
];

// Middleware
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para verificar autenticación
const isAuthenticated = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (token && sessions[token]) {
        req.userId = sessions[token].userId;
        next();
    } else {
        res.status(401).json({ error: 'No autenticado' });
    }
};

// Rutas públicas
app.get('/', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (token && sessions[token]) {
        res.sendFile(path.join(__dirname, '../public/dashboard.html'));
    } else {
        res.sendFile(path.join(__dirname, '../public/index.html'));
    }
});

// API: Obtener configuración de Firebase
app.get('/api/config', (req, res) => {
    res.json({
        firebaseConfig: {
            apiKey: process.env.FIREBASE_API_KEY,
            authDomain: process.env.FIREBASE_AUTH_DOMAIN,
            projectId: process.env.FIREBASE_PROJECT_ID,
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
            messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
            appId: process.env.FIREBASE_APP_ID,
            measurementId: process.env.FIREBASE_MEASUREMENT_ID
        }
    });
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/login.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/signup.html'));
});

app.get('/forgot-password', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/forgot-password.html'));
});

// API: Verificar sesión
app.get('/api/auth/check', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (token && sessions[token]) {
        const user = users.find(u => u.id === sessions[token].userId);
        res.json({ authenticated: true, user: { id: user.id, email: user.email } });
    } else {
        res.json({ authenticated: false });
    }
});

// API: Login
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña requeridos' });
    }
    
    const user = users.find(u => u.email === email);
    
    if (!user) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    const isValid = await bcryptjs.compare(password, user.password);
    
    if (!isValid) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    // Crear token de sesión
    const token = Math.random().toString(36).substr(2) + Date.now().toString(36);
    sessions[token] = { userId: user.id, createdAt: Date.now() };
    
    res.json({ success: true, token, message: 'Sesión iniciada' });
});

// API: Logout
app.post('/api/auth/logout', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
        delete sessions[token];
    }
    res.json({ success: true, message: 'Sesión cerrada' });
});

// API: Dashboard protegida
app.get('/api/dashboard', isAuthenticated, (req, res) => {
    const user = users.find(u => u.id === req.userId);
    res.json({ 
        message: `¡Bienvenido ${user.email}!`,
        data: { userId: user.id, email: user.email }
    });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.post('/api/contact', (req, res) => {
    const { name, email, message } = req.body;
    console.log('Contacto recibido:', { name, email, message });
    res.json({ 
        success: true, 
        message: 'Mensaje recibido correctamente',
        data: { name, email, message }
    });
});

app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

app.listen(PORT, () => {
    console.log(`✅ Servidor ejecutándose en http://localhost:${PORT}`);
    console.log(`📁 Presiona Ctrl+C para detener el servidor`);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Promesa rechazada no manejada:', reason);
});