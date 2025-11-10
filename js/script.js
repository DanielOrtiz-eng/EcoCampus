// EcoCampus - Sistema Completo para Netlify
document.addEventListener('DOMContentLoaded', function() {
    console.log('🌱 Iniciando EcoCampus en Netlify...');
    iniciarSistemaNetlify();
});

// Configuración para Netlify
const API_BASE_URL = '/.netlify/functions/api';

// Datos globales
var datosGlobales = {
    puntosReciclaje: [],
    reportes: [],
    estadisticas: {},
    configuracion: {}
};

async function iniciarSistemaNetlify() {
    await cargarDatosNetlify();
    configurarNavegacion();
    mostrarSeccion('inicio');
    iniciarActualizacionAutomatica();
    mostrarInfoSistema();
}

async function cargarDatosNetlify() {
    try {
        console.log('📡 Conectando a Netlify Functions...');
        
        const response = await fetch(API_BASE_URL);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const datos = await response.json();
        datosGlobales = {
            puntosReciclaje: datos.puntos_reciclaje || [],
            reportes: datos.reportes || [],
            estadisticas: datos.estadisticas || {},
            configuracion: datos.configuracion || {}
        };
        
        console.log('✅ Datos cargados desde Netlify');
        console.log('📊 Reportes:', datosGlobales.reportes.length);
        console.log('📍 Puntos:', datosGlobales.puntosReciclaje.length);
        
        actualizarUI();
        
    } catch (error) {
        console.error('❌ Error cargando datos:', error);
        console.log('🔄 Usando datos locales de respaldo...');
        usarDatosLocales();
    }
}

function usarDatosLocales() {
    const datosRespaldo = localStorage.getItem('ecocampus_datos_respaldo');
    
    if (datosRespaldo) {
        datosGlobales = JSON.parse(datosRespaldo);
        console.log('📂 Datos recuperados de localStorage');
    } else {
        // Datos iniciales mínimos
        datosGlobales = {
            puntosReciclaje: [
                { 
                    id: 1, 
                    nombre: "Alameda Principal", 
                    tipo: "mixto", 
                    estado: "activo", 
                    capacidad_actual: 0, 
                    capacidad_maxima: 100, 
                    ubicacion: { x: 20, y: 25 }, 
                    reportes: 0 
                },
                { 
                    id: 2, 
                    nombre: "Parquesoft - Entrada", 
                    tipo: "papel", 
                    estado: "activo", 
                    capacidad_actual: 0, 
                    capacidad_maxima: 80, 
                    ubicacion: { x: 70, y: 40 }, 
                    reportes: 0 
                },
                { 
                    id: 3, 
                    nombre: "Cafetería Central", 
                    tipo: "organico", 
                    estado: "activo", 
                    capacidad_actual: 0, 
                    capacidad_maxima: 120, 
                    ubicacion: { x: 45, y: 65 }, 
                    reportes: 0 
                },
                { 
                    id: 4, 
                    nombre: "Entrada Principal", 
                    tipo: "mixto", 
                    estado: "activo", 
                    capacidad_actual: 0, 
                    capacidad_maxima: 90, 
                    ubicacion: { x: 15, y: 75 }, 
                    reportes: 0 
                },
                { 
                    id: 5, 
                    nombre: "Estacionamiento", 
                    tipo: "plastico", 
                    estado: "activo", 
                    capacidad_actual: 0, 
                    capacidad_maxima: 70, 
                    ubicacion: { x: 80, y: 80 }, 
                    reportes: 0 
                },
                { 
                    id: 6, 
                    nombre: "Biblioteca", 
                    tipo: "papel", 
                    estado: "activo", 
                    capacidad_actual: 0, 
                    capacidad_maxima: 60, 
                    ubicacion: { x: 60, y: 20 }, 
                    reportes: 0 
                }
            ],
            reportes: [],
            estadisticas: {
                reportes_mes_actual: 0,
                reportes_resueltos: 0,
                participantes_activos: 0,
                eficiencia_sistema: 0,
                impacto_ambiental: {
                    arboles_salvados: 0,
                    energia_ahorrada_kwh: 0,
                    agua_conservada_litros: 0,
                    co2_reducido_kg: 0
                }
            },
            configuracion: {
                total_usuarios: 0,
                total_reportes: 0,
                reduccion_residuos: 0
            }
        };
        console.log('🆕 Usando datos iniciales predeterminados');
    }
    
    actualizarUI();
}

function configurarNavegacion() {
    console.log('🔧 Configurando navegación...');
    
    // Navegación principal
    var menuLinks = document.querySelectorAll('.nav-menu a');
    console.log('Encontrados ' + menuLinks.length + ' enlaces de menú');
    
    for (var i = 0; i < menuLinks.length; i++) {
        menuLinks[i].addEventListener('click', function(e) {
            e.preventDefault();
            var seccionId = this.getAttribute('href').replace('#', '');
            mostrarSeccion(seccionId);
        });
    }

    // Botones de la página de inicio
    var botonesInicio = document.querySelectorAll('#inicio .btn-small');
    
    for (var j = 0; j < botonesInicio.length; j++) {
        botonesInicio[j].addEventListener('click', function() {
            var texto = this.textContent.toLowerCase();
            if (texto.includes('reportar')) {
                mostrarSeccion('reportar');
            } else if (texto.includes('aprender')) {
                mostrarSeccion('aprender');
            } else if (texto.includes('mapa')) {
                mostrarSeccion('mapa');
            }
        });
    }

    // Formulario
    var form = document.getElementById('reportForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            enviarReporte();
        });
    }

    // Select de ubicación con nuevas zonas
    var selectUbicacion = document.getElementById('ubicacion');
    if (selectUbicacion) {
        selectUbicacion.addEventListener('change', function() {
            var grupoOtra = document.getElementById('otraUbicacionGroup');
            if (this.value === 'otra') {
                grupoOtra.classList.remove('hidden');
            } else {
                grupoOtra.classList.add('hidden');
            }
        });
    }

    // Configurar puntos del mapa
    var puntosMapa = document.querySelectorAll('.punto-mapa');
    puntosMapa.forEach(punto => {
        punto.addEventListener('click', function() {
            var nombrePunto = this.getAttribute('data-nombre');
            mostrarDetallesPunto(nombrePunto);
        });
    });
}

function mostrarSeccion(idSeccion) {
    console.log('🔄 Mostrando sección: ' + idSeccion);
    
    // Ocultar todas las secciones
    var secciones = document.querySelectorAll('.section');
    for (var i = 0; i < secciones.length; i++) {
        secciones[i].classList.remove('active');
    }

    // Mostrar sección seleccionada
    var seccion = document.getElementById(idSeccion);
    if (seccion) {
        seccion.classList.add('active');
        
        // Acciones específicas por sección
        if (idSeccion === 'mapa') {
            dibujarMapaReal();
        } else if (idSeccion === 'progreso') {
            actualizarEstadisticasAvanzadas();
        } else if (idSeccion === 'estadisticas') {
            actualizarMetricasAvanzadas();
        }
    }
}

async function enviarReporte() {
    var tipo = document.getElementById('tipo').value;
    var ubicacion = document.getElementById('ubicacion').value;
    var descripcion = document.getElementById('descripcion').value;
    var urgencia = document.getElementById('urgencia') ? document.getElementById('urgencia').value : 'media';

    if (!tipo || !ubicacion || !descripcion) {
        mostrarNotificacion('❌ Por favor completa todos los campos', 'error');
        return;
    }

    // Si es "otra ubicación", obtener ese valor
    var ubicacionFinal = ubicacion;
    if (ubicacion === 'otra') {
        var otraUbicacion = document.getElementById('otra_ubicacion').value;
        if (!otraUbicacion) {
            mostrarNotificacion('❌ Por favor especifica la ubicación', 'error');
            return;
        }
        ubicacionFinal = otraUbicacion;
    }

    var nuevoReporte = {
        id: Date.now(),
        tipo: tipo,
        ubicacion: ubicacionFinal,
        descripcion: descripcion,
        urgencia: urgencia,
        fecha: new Date().toISOString(),
        estado: 'pendiente',
        usuario: 'anonimo_' + Math.random().toString(36).substr(2, 9)
    };

    // Guardar en Netlify
    var guardadoExitoso = await guardarEnNetlify('reporte', nuevoReporte);
    
    if (guardadoExitoso) {
        // Mostrar mensaje de éxito
        var mensaje = document.getElementById('mensajeExito');
        if (mensaje) {
            mensaje.classList.remove('hidden');
            setTimeout(function() {
                mensaje.classList.add('hidden');
            }, 4000);
        }
        
        // Limpiar formulario
        document.getElementById('reportForm').reset();
        document.getElementById('otraUbicacionGroup').classList.add('hidden');
        
        actualizarUI();
        mostrarNotificacion('✅ Reporte enviado correctamente al sistema', 'exito');
    } else {
        mostrarNotificacion('❌ Error al enviar el reporte', 'error');
    }
}

async function guardarEnNetlify(tipo, datos) {
    try {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                tipo: tipo,
                datos: datos
            })
        });
        
        if (response.ok) {
            const resultado = await response.json();
            console.log('✅ Datos guardados en Netlify');
            
            // Actualizar datos locales con la respuesta del servidor
            if (resultado.datos) {
                datosGlobales = {
                    puntosReciclaje: resultado.datos.puntos_reciclaje || datosGlobales.puntosReciclaje,
                    reportes: resultado.datos.reportes || datosGlobales.reportes,
                    estadisticas: resultado.datos.estadisticas || datosGlobales.estadisticas,
                    configuracion: resultado.datos.configuracion || datosGlobales.configuracion
                };
            }
            
            return true;
        } else {
            throw new Error('Error en servidor');
        }
        
    } catch (error) {
        console.warn('⚠️ Guardando en localStorage:', error);
        // Respaldar en localStorage
        guardarEnLocalStorage(tipo, datos);
        return true;
    }
}

function guardarEnLocalStorage(tipo, datos) {
    if (tipo === 'reporte') {
        datosGlobales.reportes.unshift(datos);
        datosGlobales.configuracion.total_reportes++;
        
        // Actualizar estadísticas del mes
        var fechaReporte = new Date(datos.fecha);
        var ahora = new Date();
        if (fechaReporte.getMonth() === ahora.getMonth() && fechaReporte.getFullYear() === ahora.getFullYear()) {
            datosGlobales.estadisticas.reportes_mes_actual++;
        }
    }
    
    localStorage.setItem('ecocampus_datos_respaldo', JSON.stringify(datosGlobales));
}

function dibujarMapaReal() {
    var mapa = document.getElementById('mapa-interactivo');
    if (!mapa) return;
    
    mapa.innerHTML = '';
    
    for (var i = 0; i < datosGlobales.puntosReciclaje.length; i++) {
        var punto = datosGlobales.puntosReciclaje[i];
        var puntoElement = document.createElement('div');
        puntoElement.className = 'punto-mapa';
        puntoElement.setAttribute('data-nombre', punto.nombre);
        puntoElement.style.cssText = `position: absolute; top: ${punto.ubicacion.y}%; left: ${punto.ubicacion.x}%; cursor: pointer;`;
        
        var icono = '♻️';
        if (punto.tipo === 'papel') icono = '📄';
        else if (punto.tipo === 'plastico') icono = '🔵';
        else if (punto.tipo === 'organico') icono = '🍂';
        
        var estadoClase = punto.estado;
        if (punto.capacidad_actual >= 90) estadoClase = 'lleno';
        
        puntoElement.innerHTML = `
            <div class="punto-reciclaje ${estadoClase}">${icono}</div>
            <div class="tooltip-mapa">
                <strong>${punto.nombre}</strong><br>
                Tipo: ${punto.tipo}<br>
                Estado: ${punto.estado}<br>
                Capacidad: ${punto.capacidad_actual}%
            </div>
        `;
        
        puntoElement.addEventListener('click', function() {
            var nombrePunto = this.getAttribute('data-nombre');
            mostrarDetallesPunto(nombrePunto);
        });
        
        // Efectos hover
        puntoElement.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.2)';
            this.style.zIndex = '10';
        });
        
        puntoElement.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
            this.style.zIndex = '1';
        });
        
        mapa.appendChild(puntoElement);
    }
}

function mostrarDetallesPunto(nombrePunto) {
    var punto = datosGlobales.puntosReciclaje.find(p => p.nombre === nombrePunto);
    if (punto) {
        var mensaje = `
📍 ${punto.nombre}
📊 Tipo: ${punto.tipo}
🔄 Estado: ${punto.estado}
📈 Capacidad: ${punto.capacidad_actual}% de ${punto.capacidad_maxima}%
📝 Reportes: ${punto.reportes}

¿Quieres reportar algo en este punto?
        `;
        
        if (confirm(mensaje)) {
            mostrarSeccion('reportar');
            // Pre-seleccionar la ubicación
            var select = document.getElementById('ubicacion');
            for (var i = 0; i < select.options.length; i++) {
                if (select.options[i].text.includes(punto.nombre.split(' - ')[0])) {
                    select.value = select.options[i].value;
                    break;
                }
            }
        }
    }
}

function actualizarUI() {
    // Actualizar estadísticas principales
    document.getElementById('stats-total-reportes').textContent = datosGlobales.configuracion.total_reportes || 0;
    document.getElementById('stats-puntos-activos').textContent = datosGlobales.puntosReciclaje.length;
    document.getElementById('stats-participantes').textContent = datosGlobales.estadisticas.participantes_activos || 0;
    document.getElementById('stats-reduccion').textContent = (datosGlobales.configuracion.reduccion_residuos || 0) + '%';
    
    // Actualizar dashboard de progreso
    document.getElementById('reportes-mes').textContent = datosGlobales.estadisticas.reportes_mes_actual || 0;
    document.getElementById('eficiencia-sistema').textContent = (datosGlobales.estadisticas.eficiencia_sistema || 0) + '%';
    document.getElementById('participacion-activa').textContent = datosGlobales.estadisticas.participantes_activos || 0;
    
    // Actualizar impacto ambiental
    var impacto = datosGlobales.estadisticas.impacto_ambiental || {};
    document.getElementById('arboles-salvados').textContent = impacto.arboles_salvados || 0;
    document.getElementById('energia-ahorrada').textContent = (impacto.energia_ahorrada_kwh || 0) + ' kWh';
    document.getElementById('agua-conservada').textContent = (impacto.agua_conservada_litros || 0) + ' L';
    document.getElementById('co2-reducido').textContent = (impacto.co2_reducido_kg || 0) + ' kg';
    
    // Actualizar lista de reportes
    actualizarListaReportes();
    
    // Actualizar alertas
    actualizarAlertas();
    
    // Actualizar mis reportes
    actualizarMisReportes();
}

function actualizarListaReportes() {
    var lista = document.getElementById('listaReportes');
    if (lista) {
        lista.innerHTML = '';
        
        if (datosGlobales.reportes.length === 0) {
            lista.innerHTML = '<p>No hay reportes en el sistema. ¡Sé el primero en reportar!</p>';
            return;
        }
        
        for (var i = 0; i < Math.min(datosGlobales.reportes.length, 5); i++) {
            var reporte = datosGlobales.reportes[i];
            var item = document.createElement('div');
            item.className = 'reporte-item';
            
            var fecha = new Date(reporte.fecha).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short'
            });
            
            var tipoTexto = '📝 Reporte';
            if (reporte.tipo === 'contenedor_lleno') tipoTexto = '🚮 Lleno';
            else if (reporte.tipo === 'contenedor_danado') tipoTexto = '⚠️ Dañado';
            else if (reporte.tipo === 'residuos_mezclados') tipoTexto = '🔀 Mezclado';
            else if (reporte.tipo === 'nuevo_punto') tipoTexto = '💡 Nuevo punto';
            else if (reporte.tipo === 'limpieza_requerida') tipoTexto = '🧹 Limpieza';
            
            var urgenciaIcono = '🟡';
            if (reporte.urgencia === 'alta') urgenciaIcono = '🔴';
            else if (reporte.urgencia === 'baja') urgenciaIcono = '🟢';
            
            item.innerHTML = `
                <div class="reporte-header">
                    <strong>${reporte.ubicacion}</strong>
                    <span class="reporte-fecha">${fecha} ${urgenciaIcono}</span>
                </div>
                <p>${tipoTexto} - ${reporte.descripcion.substring(0, 80)}${reporte.descripcion.length > 80 ? '...' : ''}</p>
            `;
            
            lista.appendChild(item);
        }
    }
}

function actualizarMisReportes() {
    var container = document.getElementById('mis-reportes-container');
    if (!container) return;
    
    var misReportes = datosGlobales.reportes.filter(r => r.usuario && r.usuario.includes('anonimo'));
    
    if (misReportes.length === 0) {
        container.innerHTML = '<p>No has enviado reportes aún</p>';
        return;
    }
    
    container.innerHTML = '';
    for (var i = 0; i < Math.min(misReportes.length, 3); i++) {
        var reporte = misReportes[i];
        var item = document.createElement('div');
        item.className = 'reporte-item';
        
        var fecha = new Date(reporte.fecha).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        var estadoColor = reporte.estado === 'resuelto' ? '🟢' : reporte.estado === 'en_proceso' ? '🟡' : '🔴';
        
        item.innerHTML = `
            <div class="reporte-header">
                <strong>${reporte.ubicacion}</strong>
                <span class="reporte-fecha">${fecha} ${estadoColor}</span>
            </div>
            <p>${reporte.descripcion.substring(0, 60)}${reporte.descripcion.length > 60 ? '...' : ''}</p>
            <small>Estado: ${reporte.estado}</small>
        `;
        
        container.appendChild(item);
    }
}

function actualizarAlertas() {
    var container = document.getElementById('alertas-container');
    if (!container) return;
    
    // Alertas basadas en datos reales
    var alertas = [];
    
    // Puntos llenos
    var puntosLlenos = datosGlobales.puntosReciclaje.filter(p => p.capacidad_actual >= 90);
    puntosLlenos.forEach(punto => {
        alertas.push({
            tipo: 'critica',
            mensaje: `🚨 ${punto.nombre} al ${punto.capacidad_actual}% de capacidad`
        });
    });
    
    // Reportes urgentes
    var reportesUrgentes = datosGlobales.reportes.filter(r => r.urgencia === 'alta' && r.estado === 'pendiente');
    if (reportesUrgentes.length > 0) {
        alertas.push({
            tipo: 'critica', 
            mensaje: `⚠️ ${reportesUrgentes.length} reporte(s) urgente(s) pendientes`
        });
    }
    
    // Sistema nuevo
    if (datosGlobales.reportes.length === 0) {
        alertas.push({
            tipo: 'informativa',
            mensaje: '🎉 ¡Bienvenido! Sé el primero en enviar un reporte'
        });
    }
    
    if (alertas.length === 0) {
        alertas.push({
            tipo: 'informativa',
            mensaje: '✅ Sistema operando normalmente'
        });
    }
    
    container.innerHTML = '';
    alertas.forEach(alerta => {
        var div = document.createElement('div');
        div.className = `alerta-item ${alerta.tipo}`;
        div.textContent = alerta.mensaje;
        container.appendChild(div);
    });
}

function actualizarEstadisticasAvanzadas() {
    // Calcular gráfico de reportes por día (últimos 7 días)
    var graficoReportes = document.getElementById('grafico-reportes');
    if (graficoReportes) {
        var ultimos7Dias = [];
        for (var i = 6; i >= 0; i--) {
            var fecha = new Date();
            fecha.setDate(fecha.getDate() - i);
            var fechaStr = fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
            
            var reportesDia = datosGlobales.reportes.filter(reporte => {
                var fechaReporte = new Date(reporte.fecha);
                return fechaReporte.toDateString() === fecha.toDateString();
            }).length;
            
            ultimos7Dias.push({ fecha: fechaStr, reportes: reportesDia });
        }
        
        var maxReportes = Math.max(...ultimos7Dias.map(d => d.reportes), 1);
        
        graficoReportes.innerHTML = '';
        ultimos7Dias.forEach(dia => {
            var altura = (dia.reportes / maxReportes) * 150;
            var barra = document.createElement('div');
            barra.className = 'barra-dia';
            barra.innerHTML = `
                <div class="barra" style="height: ${altura}px"></div>
                <div class="dia-label">${dia.fecha}</div>
                <div class="dia-valor">${dia.reportes}</div>
            `;
            graficoReportes.appendChild(barra);
        });
    }
}

function actualizarMetricasAvanzadas() {
    // Actualizar métricas del centro de datos
    document.getElementById('tiempo-respuesta').textContent = '0h';
    document.getElementById('satisfaccion-usuario').textContent = '0%';
    document.getElementById('huella-carbon').textContent = '0 kg';
}

function iniciarActualizacionAutomatica() {
    // Actualizar datos cada 60 segundos
    setInterval(async () => {
        console.log('🔄 Actualización automática de datos...');
        await cargarDatosNetlify();
    }, 60000);
}

function mostrarInfoSistema() {
    var info = `
🌐 ECOCAMPUS UNIAJC
------------------------
📊 Reportes totales: ${datosGlobales.configuracion.total_reportes}
📍 Puntos activos: ${datosGlobales.puntosReciclaje.length}
👥 Participantes: ${datosGlobales.estadisticas.participantes_activos}
🔄 Actualizado: ${new Date().toLocaleString()}
------------------------
✅ Sistema listo para Netlify
    `;
    
    console.log(info);
}

function mostrarNotificacion(mensaje, tipo = 'info') {
    var notificacion = document.createElement('div');
    notificacion.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${tipo === 'exito' ? '#4CAF50' : tipo === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        animation: slideInRight 0.3s ease;
        font-family: inherit;
        font-size: 14px;
        font-weight: 500;
    `;
    notificacion.textContent = mensaje;
    document.body.appendChild(notificacion);
    
    setTimeout(function() {
        notificacion.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notificacion.parentElement) {
                notificacion.remove();
            }
        }, 300);
    }, 4000);
}

// Funciones globales para HTML
window.mostrarSeccion = mostrarSeccion;

window.exportarDatos = function() {
    var datosExportar = {
        reportes: datosGlobales.reportes,
        puntos_reciclaje: datosGlobales.puntosReciclaje,
        estadisticas: datosGlobales.estadisticas,
        configuracion: datosGlobales.configuracion,
        fecha_exportacion: new Date().toISOString()
    };
    
    var datosStr = JSON.stringify(datosExportar, null, 2);
    var blob = new Blob([datosStr], {type: 'application/json'});
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = `ecocampus_datos_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    mostrarNotificacion('📄 Datos exportados correctamente', 'exito');
};

window.filtrarPuntos = function(filtro) {
    console.log('Filtrando puntos:', filtro);
    // Implementar filtrado si es necesario
    dibujarMapaReal();
};

window.filtrarReportesGlobales = function(filtro) {
    console.log('Filtrando reportes:', filtro);
    actualizarListaReportes();
};

// Agregar estilos para animaciones
var style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .grafico-barras {
        display: flex;
        align-items: end;
        gap: 10px;
        height: 200px;
        margin-top: 1rem;
        padding: 1rem;
        background: #f8f9fa;
        border-radius: 8px;
    }
    
    .barra-dia {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 5px;
    }
    
    .barra {
        background: linear-gradient(to top, #4CAF50, #388E3C);
        width: 30px;
        border-radius: 4px 4px 0 0;
        transition: height 0.3s ease;
        min-height: 5px;
    }
    
    .dia-label {
        font-size: 0.8rem;
        color: #666;
    }
    
    .dia-valor {
        font-size: 0.9rem;
        font-weight: bold;
        color: #333;
    }
`;
document.head.appendChild(style);

console.log('🚀 EcoCampus Netlify - Sistema completo cargado');
// Sistema de Avisos y Estado
function mostrarAvisoSistema() {
    const aviso = document.getElementById('aviso-sistema');
    if (aviso) {
        // Mostrar aviso solo si no estaba cerrado previamente
        const avisoCerrado = localStorage.getItem('aviso_sistema_cerrado');
        if (!avisoCerrado) {
            aviso.style.display = 'block';
        }
    }
}

function cerrarAviso() {
    const aviso = document.getElementById('aviso-sistema');
    if (aviso) {
        aviso.classList.add('cerrando');
        setTimeout(() => {
            aviso.style.display = 'none';
            localStorage.setItem('aviso_sistema_cerrado', 'true');
        }, 500);
    }
}

function mostrarEstadoSistema(seccion) {
    const contenedores = document.querySelectorAll('.estado-sistema-container');
    contenedores.forEach(container => container.remove());

    let mensaje = '';
    
    switch(seccion) {
        case 'mapa':
            mensaje = crearEstadoMapa();
            break;
        case 'reportar':
            mensaje = crearEstadoReportes();
            break;
        case 'progreso':
            mensaje = crearEstadoProgreso();
            break;
        case 'admin-puntos':
            mensaje = crearEstadoAdmin();
            break;
        default:
            mensaje = crearEstadoGeneral();
    }

    const seccionElement = document.getElementById(seccion);
    if (seccionElement) {
        seccionElement.insertAdjacentHTML('afterbegin', mensaje);
    }
}

function crearEstadoGeneral() {
    return `
        <div class="estado-sistema-container">
            <div class="estado-sistema">
                <div class="estado-header">
                    <div class="estado-icon">🌐</div>
                    <h4 class="estado-title">Estado del Sistema EcoCampus</h4>
                </div>
                <div class="estado-content">
                    <p><strong>Modo Local Activado</strong> - Esta instancia funciona con almacenamiento en tu navegador.</p>
                    
                    <div class="estado-features">
                        <p><strong>Funcionalidades disponibles:</strong></p>
                        <ul>
                            <li>✅ Reportar problemas y sugerencias</li>
                            <li>✅ Ver mapa interactivo de puntos</li>
                            <li>✅ Gestionar puntos de reciclaje</li>
                            <li>✅ Ver estadísticas locales</li>
                            <li>✅ Centro de aprendizaje</li>
                        </ul>
                        
                        <p><strong>Limitaciones actuales:</strong></p>
                        <ul>
                            <li>📱 Los datos no se sincronizan entre dispositivos</li>
                            <li>🌐 No hay conexión con servicios en la nube</li>
                            <li>👥 Los reportes son visibles solo localmente</li>
                            <li>📊 Las estadísticas no se comparten globalmente</li>
                        </ul>
                    </div>
                    
                    <div class="estado-actions">
                        <button class="btn-small" onclick="exportarRespaldo()">💾 Exportar Respaldo</button>
                        <button class="btn-small" onclick="importarRespaldo()">📥 Importar Datos</button>
                        <button class="btn-small" onclick="resetearDatos()">🔄 Resetear Sistema</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function crearEstadoMapa() {
    return `
        <div class="estado-sistema-container">
            <div class="estado-sistema info">
                <div class="estado-header">
                    <div class="estado-icon">🗺️</div>
                    <h4 class="estado-title">Mapa Interactivo - Modo Local</h4>
                </div>
                <div class="estado-content">
                    <p>Los puntos de reciclaje mostrados están almacenados localmente en tu navegador.</p>
                    <ul>
                        <li><strong>Puntos activos:</strong> ${datosGlobales.puntosReciclaje.length}</li>
                        <li><strong>Última actualización:</strong> ${new Date().toLocaleDateString()}</li>
                        <li><strong>Alcance:</strong> Solo visible en este dispositivo</li>
                    </ul>
                    <p>Para gestionar los puntos, ve a la sección <strong>"Admin Puntos"</strong> en el menú.</p>
                </div>
            </div>
        </div>
    `;
}

function crearEstadoReportes() {
    return `
        <div class="estado-sistema-container">
            <div class="estado-sistema">
                <div class="estado-header">
                    <div class="estado-icon">📝</div>
                    <h4 class="estado-title">Sistema de Reportes - Almacenamiento Local</h4>
                </div>
                <div class="estado-content">
                    <p>Los reportes que envías se guardan en tu navegador y no se envían a un servidor central.</p>
                    
                    <div class="estado-features">
                        <p><strong>Información importante:</strong></p>
                        <ul>
                            <li>📊 Total de reportes locales: ${datosGlobales.reportes.length}</li>
                            <li>🔒 Tus datos son privados en este dispositivo</li>
                            <li>📤 Puedes exportar tus reportes para respaldo</li>
                            <li>⚠️ Los reportes no llegan al personal administrativo</li>
                        </ul>
                    </div>
                    
                    <p><em>Esta es una versión de demostración. En producción, los reportes llegarían al equipo de mantenimiento.</em></p>
                </div>
            </div>
        </div>
    `;
}

function crearEstadoAdmin() {
    return `
        <div class="estado-sistema-container">
            <div class="estado-sistema success">
                <div class="estado-header">
                    <div class="estado-icon">⚙️</div>
                    <h4 class="estado-title">Panel de Administración - Edición Local</h4>
                </div>
                <div class="estado-content">
                    <p>Puedes gestionar completamente los puntos de reciclaje, pero los cambios solo se aplican localmente.</p>
                    
                    <div class="estado-features">
                        <p><strong>Operaciones disponibles:</strong></p>
                        <ul>
                            <li>➕ Agregar nuevos puntos de reciclaje</li>
                            <li>✏️ Editar puntos existentes</li>
                            <li>🗑️ Eliminar puntos</li>
                            <li>📍 Reposicionar en el mapa</li>
                            <li>📊 Actualizar estados y capacidades</li>
                        </ul>
                    </div>
                    
                    <p><strong>Nota:</strong> Los cambios no se reflejarán en otros dispositivos o usuarios.</p>
                </div>
            </div>
        </div>
    `;
}

// Funciones de utilidad para el modo local
function exportarRespaldo() {
    const datosExportar = {
        ...datosGlobales,
        metadata: {
            fecha_exportacion: new Date().toISOString(),
            version: '1.0',
            total_puntos: datosGlobales.puntosReciclaje.length,
            total_reportes: datosGlobales.reportes.length
        }
    };
    
    const datosStr = JSON.stringify(datosExportar, null, 2);
    const blob = new Blob([datosStr], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ecocampus_respaldo_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    mostrarNotificacion('💾 Respaldo exportado correctamente', 'exito');
}

function importarRespaldo() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = e => {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = event => {
            try {
                const datosImportados = JSON.parse(event.target.result);
                
                // Validar estructura básica
                if (datosImportados.puntosReciclaje && datosImportados.reportes) {
                    datosGlobales = datosImportados;
                    localStorage.setItem('ecocampus_datos_respaldo', JSON.stringify(datosGlobales));
                    actualizarUI();
                    mostrarNotificacion('📥 Datos importados correctamente', 'exito');
                } else {
                    throw new Error('Formato de archivo inválido');
                }
            } catch (error) {
                mostrarNotificacion('❌ Error al importar el archivo', 'error');
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

function resetearDatos() {
    if (confirm('¿Estás seguro de que quieres resetear todos los datos? Esta acción no se puede deshacer.')) {
        localStorage.removeItem('ecocampus_datos_respaldo');
        location.reload();
    }
}

// Modificar la función mostrarSeccion para incluir el estado del sistema
function mostrarSeccion(idSeccion) {
    console.log('🔄 Mostrando sección: ' + idSeccion);
    
    // Ocultar todas las secciones
    var secciones = document.querySelectorAll('.section');
    for (var i = 0; i < secciones.length; i++) {
        secciones[i].classList.remove('active');
    }

    // Mostrar sección seleccionada
    var seccion = document.getElementById(idSeccion);
    if (seccion) {
        seccion.classList.add('active');
        
        // Mostrar estado del sistema para la sección
        mostrarEstadoSistema(idSeccion);
        
        // Acciones específicas por sección
        if (idSeccion === 'mapa') {
            dibujarMapaReal();
        } else if (idSeccion === 'progreso') {
            actualizarEstadisticasAvanzadas();
        } else if (idSeccion === 'estadisticas') {
            actualizarMetricasAvanzadas();
        } else if (idSeccion === 'admin-puntos' && typeof adminPuntos !== 'undefined') {
            adminPuntos.cargarPuntosEnAdmin();
        }
    }
}

// Inicializar avisos cuando carga la página
document.addEventListener('DOMContentLoaded', function() {
    console.log('🌱 Iniciando EcoCampus en Netlify...');
    iniciarSistemaNetlify();
    mostrarAvisoSistema(); // ← Agregar esta línea
});