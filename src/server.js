// Servidor Node.js con Express
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static(path.join(__dirname, '../')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Ruta para recibir datos del formulario de contacto
app.post('/api/contact', (req, res) => {
    const { name, email, message } = req.body;
    
    // Aquí puedes procesar el formulario
    // Por ejemplo, guardar en base de datos o enviar email
    console.log('Contacto recibido:', { name, email, message });
    
    res.json({ 
        success: true, 
        message: 'Mensaje recibido correctamente',
        data: { name, email, message }
    });
});

// Manejo de errores 404
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`✅ Servidor ejecutándose en http://localhost:${PORT}`);
    console.log(`📁 Presiona Ctrl+C para detener el servidor`);
});

// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
    console.error('Promesa rechazada no manejada:', reason);
});
