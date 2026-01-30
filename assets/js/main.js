// Funciones principales de la aplicación

// Event listener para el botón "Comenzar"
document.getElementById('getStartedBtn')?.addEventListener('click', () => {
    alert('¡Bienvenido! Tu portal está listo para usar.');
    console.log('Botón comenzar presionado');
});

// Event listener para el formulario de contacto
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const inputs = contactForm.querySelectorAll('input, textarea');
        const formData = {};
        
        inputs.forEach(input => {
            if (input.value) {
                formData[input.placeholder] = input.value;
            }
        });
        
        console.log('Formulario enviado:', formData);
        alert('¡Gracias por tu mensaje! Te contactaremos pronto.');
        contactForm.reset();
    });
}

// Función para cambiar tema (ejemplo)
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
}

// Cargar tema guardado
window.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
    }
    console.log('Portal cargado correctamente');
});

// Funciones utilitarias
const Utils = {
    // Función para hacer peticiones
    async fetch(url, options = {}) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) throw new Error(`Error: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Error en fetch:', error);
            return null;
        }
    },
    
    // Función para guardar datos en localStorage
    saveToLocalStorage(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    },
    
    // Función para obtener datos de localStorage
    getFromLocalStorage(key) {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    },
    
    // Función para validar email
    validateEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }
};

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}
