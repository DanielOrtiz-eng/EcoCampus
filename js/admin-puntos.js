// EcoCampus - Sistema de Administración de Puntos de Reciclaje
class AdminPuntos {
    constructor() {
        this.puntoEditando = null;
        this.init();
    }

    init() {
        this.configurarEventos();
        this.cargarPuntosEnAdmin();
        this.configurarMapaPosicionamiento();
    }

    configurarEventos() {
        // Formulario de puntos
        const form = document.getElementById('puntoForm');
        if (form) {
            form.addEventListener('submit', (e) => this.guardarPunto(e));
        }

        // Evento click en el mapa de posicionamiento
        const mapaPos = document.getElementById('mapa-posicionamiento');
        if (mapaPos) {
            mapaPos.addEventListener('click', (e) => this.posicionarPuntoEnMapa(e));
        }
    }

    configurarMapaPosicionamiento() {
        const mapa = document.getElementById('mapa-posicionamiento');
        if (!mapa) return;

        // Crear mapa visual para posicionamiento
        mapa.innerHTML = `
            <div class="mapa-background">
                <div class="edificios">
                    <div class="edificio bloque-a" style="top: 20%; left: 15%;">🏢 Bloque A</div>
                    <div class="edificio bloque-b" style="top: 35%; left: 60%;">🏢 Bloque B</div>
                    <div class="edificio cafeteria" style="top: 60%; left: 40%;">🍽 Cafetería</div>
                    <div class="edificio biblioteca" style="top: 15%; left: 70%;">📚 Biblioteca</div>
                    <div class="edificio entrada" style="top: 75%; left: 20%;">🚪 Entrada</div>
                    <div class="edificio estacionamiento" style="top: 80%; left: 75%;">🅿 Estacionamiento</div>
                </div>
                <div class="puntos-container" id="puntos-container"></div>
            </div>
        `;

        this.actualizarPuntosEnMapaAdmin();
    }

    actualizarPuntosEnMapaAdmin() {
        const container = document.getElementById('puntos-container');
        if (!container) return;

        container.innerHTML = '';

        datosGlobales.puntosReciclaje.forEach(punto => {
            const puntoElement = document.createElement('div');
            puntoElement.className = `punto-admin ${punto.estado}`;
            puntoElement.style.cssText = `
                position: absolute;
                top: ${punto.ubicacion.y}%;
                left: ${punto.ubicacion.x}%;
                cursor: move;
                z-index: 10;
            `;
            puntoElement.setAttribute('data-id', punto.id);
            puntoElement.setAttribute('draggable', 'true');

            const icono = this.obtenerIconoTipo(punto.tipo);
            
            puntoElement.innerHTML = `
                <div class="punto-mapa-admin">
                    ${icono}
                    <div class="tooltip-admin">
                        <strong>${punto.nombre}</strong><br>
                        ${punto.tipo} • ${punto.estado}
                    </div>
                </div>
            `;

            // Eventos de drag and drop
            puntoElement.addEventListener('dragstart', (e) => this.iniciarArrastre(e));
            puntoElement.addEventListener('click', (e) => this.editarPunto(punto.id));

            container.appendChild(puntoElement);
        });

        this.actualizarTablaPuntos();
    }

    obtenerIconoTipo(tipo) {
        const iconos = {
            'mixto': '♻️',
            'papel': '📄',
            'plastico': '🔵',
            'organico': '🍂',
            'vidrio': '🥫'
        };
        return iconos[tipo] || '♻️';
    }

    iniciarArrastre(e) {
        e.dataTransfer.setData('text/plain', e.target.closest('.punto-admin').getAttribute('data-id'));
    }

    posicionarPuntoEnMapa(e) {
        if (this.puntoEditando) {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;

            document.getElementById('puntoX').value = Math.round(x);
            document.getElementById('puntoY').value = Math.round(y);
        }
    }

    cargarPuntosEnAdmin() {
        this.actualizarPuntosEnMapaAdmin();
    }

    async guardarPunto(e) {
        e.preventDefault();

        const id = document.getElementById('puntoId').value;
        const nombre = document.getElementById('puntoNombre').value;
        const tipo = document.getElementById('puntoTipo').value;
        const estado = document.getElementById('puntoEstado').value;
        const x = parseInt(document.getElementById('puntoX').value);
        const y = parseInt(document.getElementById('puntoY').value);
        const capacidad = parseInt(document.getElementById('puntoCapacidad').value);

        if (!nombre || !tipo || !estado) {
            this.mostrarNotificacion('❌ Completa todos los campos requeridos', 'error');
            return;
        }

        const puntoData = {
            nombre: nombre,
            tipo: tipo,
            estado: estado,
            ubicacion: { x: x, y: y },
            capacidad_maxima: capacidad,
            capacidad_actual: 0,
            reportes: 0,
            ultima_actualizacion: new Date().toISOString()
        };

        try {
            if (id) {
                // Editar punto existente
                await this.actualizarPuntoExistente(parseInt(id), puntoData);
            } else {
                // Crear nuevo punto
                await this.crearNuevoPunto(puntoData);
            }

            this.limpiarFormulario();
            this.actualizarPuntosEnMapaAdmin();
            this.mostrarNotificacion('✅ Punto guardado correctamente', 'exito');

        } catch (error) {
            console.error('Error guardando punto:', error);
            this.mostrarNotificacion('❌ Error al guardar el punto', 'error');
        }
    }

    async actualizarPuntoExistente(id, datos) {
        const puntoIndex = datosGlobales.puntosReciclaje.findIndex(p => p.id === id);
        if (puntoIndex !== -1) {
            datosGlobales.puntosReciclaje[puntoIndex] = {
                ...datosGlobales.puntosReciclaje[puntoIndex],
                ...datos
            };

            // Guardar en Netlify
            await this.guardarEnNetlify('actualizar_punto', {
                puntoId: id,
                datos: datosGlobales.puntosReciclaje[puntoIndex]
            });
        }
    }

    async crearNuevoPunto(datos) {
        const nuevoId = Math.max(...datosGlobales.puntosReciclaje.map(p => p.id), 0) + 1;
        const nuevoPunto = {
            id: nuevoId,
            ...datos
        };

        datosGlobales.puntosReciclaje.push(nuevoPunto);

        // Guardar en Netlify
        await this.guardarEnNetlify('nuevo_punto', nuevoPunto);
    }

    async guardarEnNetlify(tipo, datos) {
        try {
            const response = await fetch('/.netlify/functions/api', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tipo: tipo,
                    datos: datos
                })
            });

            if (!response.ok) throw new Error('Error en servidor');
            
            // Actualizar datos locales
            const resultado = await response.json();
            if (resultado.datos) {
                datosGlobales.puntosReciclaje = resultado.datos.puntos_reciclaje || datosGlobales.puntosReciclaje;
            }

        } catch (error) {
            console.warn('⚠️ Guardando en localStorage:', error);
            localStorage.setItem('ecocampus_datos_respaldo', JSON.stringify(datosGlobales));
        }
    }

    editarPunto(id) {
        const punto = datosGlobales.puntosReciclaje.find(p => p.id === id);
        if (!punto) return;

        this.puntoEditando = id;

        document.getElementById('puntoId').value = punto.id;
        document.getElementById('puntoNombre').value = punto.nombre;
        document.getElementById('puntoTipo').value = punto.tipo;
        document.getElementById('puntoEstado').value = punto.estado;
        document.getElementById('puntoX').value = punto.ubicacion.x;
        document.getElementById('puntoY').value = punto.ubicacion.y;
        document.getElementById('puntoCapacidad').value = punto.capacidad_maxima;

        document.getElementById('form-titulo').textContent = '✏️ Editando Punto';
        document.getElementById('btnGuardarPunto').textContent = '💾 Actualizar Punto';

        // Scroll al formulario
        document.getElementById('puntoForm').scrollIntoView({ behavior: 'smooth' });
    }

    async eliminarPunto(id) {
        if (!confirm('¿Estás seguro de que quieres eliminar este punto de reciclaje?')) {
            return;
        }

        try {
            datosGlobales.puntosReciclaje = datosGlobales.puntosReciclaje.filter(p => p.id !== id);
            
            // Guardar en Netlify
            await this.guardarEnNetlify('eliminar_punto', { puntoId: id });

            this.actualizarPuntosEnMapaAdmin();
            this.mostrarNotificacion('🗑️ Punto eliminado correctamente', 'exito');

        } catch (error) {
            console.error('Error eliminando punto:', error);
            this.mostrarNotificacion('❌ Error al eliminar el punto', 'error');
        }
    }

    limpiarFormulario() {
        document.getElementById('puntoId').value = '';
        document.getElementById('puntoNombre').value = '';
        document.getElementById('puntoTipo').value = 'mixto';
        document.getElementById('puntoEstado').value = 'activo';
        document.getElementById('puntoX').value = '50';
        document.getElementById('puntoY').value = '50';
        document.getElementById('puntoCapacidad').value = '100';

        document.getElementById('form-titulo').textContent = '➕ Agregar Nuevo Punto';
        document.getElementById('btnGuardarPunto').textContent = '💾 Guardar Punto';

        this.puntoEditando = null;
    }

    actualizarTablaPuntos() {
        const tbody = document.getElementById('tabla-puntos-body');
        if (!tbody) return;

        tbody.innerHTML = '';

        datosGlobales.puntosReciclaje.forEach(punto => {
            const fila = document.createElement('tr');
            
            fila.innerHTML = `
                <td>
                    <strong>${punto.nombre}</strong>
                    <br><small>ID: ${punto.id}</small>
                </td>
                <td>
                    <span class="badge-tipo ${punto.tipo}">
                        ${this.obtenerIconoTipo(punto.tipo)} ${punto.tipo}
                    </span>
                </td>
                <td>
                    <span class="badge-estado ${punto.estado}">
                        ${punto.estado}
                    </span>
                </td>
                <td>
                    X: ${punto.ubicacion.x}%<br>
                    Y: ${punto.ubicacion.y}%
                </td>
                <td>
                    <div class="acciones-tabla">
                        <button class="btn-small btn-editar" onclick="adminPuntos.editarPunto(${punto.id})">
                            ✏️ Editar
                        </button>
                        <button class="btn-small btn-eliminar" onclick="adminPuntos.eliminarPunto(${punto.id})">
                            🗑️ Eliminar
                        </button>
                    </div>
                </td>
            `;

            tbody.appendChild(fila);
        });
    }

    mostrarNotificacion(mensaje, tipo = 'info') {
        // Reutilizar la función del script principal si existe
        if (typeof mostrarNotificacion === 'function') {
            mostrarNotificacion(mensaje, tipo);
        } else {
            // Función de respaldo
            alert(mensaje);
        }
    }
}

// Inicializar el sistema de administración cuando se carga la página
let adminPuntos;

document.addEventListener('DOMContentLoaded', function() {
    adminPuntos = new AdminPuntos();
});

// Funciones globales para HTML
window.limpiarFormulario = function() {
    if (adminPuntos) {
        adminPuntos.limpiarFormulario();
    }
};

window.actualizarMapaAdmin = function() {
    if (adminPuntos) {
        adminPuntos.actualizarPuntosEnMapaAdmin();
    }
};