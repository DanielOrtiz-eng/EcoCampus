// Netlify Function para la API de EcoCampus
const fs = require('fs');
const path = require('path');

exports.handler = async (event) => {
    // Configurar CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Manejar preflight OPTIONS
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    const datosPath = path.join(process.cwd(), 'api', 'datos.json');
    
    try {
        switch (event.httpMethod) {
            case 'GET':
                if (fs.existsSync(datosPath)) {
                    const datos = JSON.parse(fs.readFileSync(datosPath, 'utf8'));
                    return {
                        statusCode: 200,
                        headers,
                        body: JSON.stringify(datos)
                    };
                } else {
                    // Si no existe el archivo, crear estructura inicial
                    const datosIniciales = {
                        configuracion: {
                            version: "1.0",
                            ultima_actualizacion: new Date().toISOString(),
                            total_usuarios: 0,
                            total_reportes: 0,
                            reduccion_residuos: 0
                        },
                        puntos_reciclaje: [
                            {
                                id: 1,
                                nombre: "Alameda Principal",
                                tipo: "mixto",
                                estado: "activo",
                                capacidad_actual: 0,
                                capacidad_maxima: 100,
                                ubicacion: { x: 20, y: 25 },
                                reportes: 0,
                                ultima_actualizacion: new Date().toISOString()
                            },
                            {
                                id: 2,
                                nombre: "Parquesoft - Entrada",
                                tipo: "papel", 
                                estado: "activo",
                                capacidad_actual: 0,
                                capacidad_maxima: 80,
                                ubicacion: { x: 70, y: 40 },
                                reportes: 0,
                                ultima_actualizacion: new Date().toISOString()
                            },
                            {
                                id: 3,
                                nombre: "Cafetería Central",
                                tipo: "organico",
                                estado: "activo",
                                capacidad_actual: 0,
                                capacidad_maxima: 120,
                                ubicacion: { x: 45, y: 65 },
                                reportes: 0,
                                ultima_actualizacion: new Date().toISOString()
                            },
                            {
                                id: 4,
                                nombre: "Entrada Principal",
                                tipo: "mixto",
                                estado: "activo",
                                capacidad_actual: 0,
                                capacidad_maxima: 90,
                                ubicacion: { x: 15, y: 75 },
                                reportes: 0,
                                ultima_actualizacion: new Date().toISOString()
                            },
                            {
                                id: 5,
                                nombre: "Estacionamiento",
                                tipo: "plastico",
                                estado: "activo",
                                capacidad_actual: 0,
                                capacidad_maxima: 70,
                                ubicacion: { x: 80, y: 80 },
                                reportes: 0,
                                ultima_actualizacion: new Date().toISOString()
                            },
                            {
                                id: 6,
                                nombre: "Biblioteca",
                                tipo: "papel",
                                estado: "activo",
                                capacidad_actual: 0,
                                capacidad_maxima: 60,
                                ubicacion: { x: 60, y: 20 },
                                reportes: 0,
                                ultima_actualizacion: new Date().toISOString()
                            }
                        ],
                        reportes: [],
                        usuarios: [],
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
                        log_actividad: []
                    };

                    // Crear directorio si no existe
                    const dir = path.dirname(datosPath);
                    if (!fs.existsSync(dir)) {
                        fs.mkdirSync(dir, { recursive: true });
                    }
                    
                    fs.writeFileSync(datosPath, JSON.stringify(datosIniciales, null, 2));
                    
                    return {
                        statusCode: 200,
                        headers,
                        body: JSON.stringify(datosIniciales)
                    };
                }
                
            case 'POST':
                const body = JSON.parse(event.body);
                let datosActuales;

                if (fs.existsSync(datosPath)) {
                    datosActuales = JSON.parse(fs.readFileSync(datosPath, 'utf8'));
                } else {
                    // Si no existe, usar el handler GET para crear estructura
                    const getResponse = await exports.handler({ ...event, httpMethod: 'GET' });
                    datosActuales = JSON.parse(getResponse.body);
                }

                // Procesar diferentes tipos de datos
                if (body.tipo === 'reporte') {
                    const nuevoReporte = {
                        id: Date.now(),
                        ...body.datos,
                        fecha: new Date().toISOString(),
                        estado: 'pendiente'
                    };
                    
                    datosActuales.reportes.unshift(nuevoReporte);
                    datosActuales.configuracion.total_reportes++;
                    datosActuales.estadisticas.reportes_mes_actual++;
                    
                    // Actualizar último punto si corresponde
                    const puntoIndex = datosActuales.puntos_reciclaje.findIndex(
                        p => p.nombre === body.datos.ubicacion
                    );
                    if (puntoIndex !== -1) {
                        datosActuales.puntos_reciclaje[puntoIndex].reportes++;
                        datosActuales.puntos_reciclaje[puntoIndex].ultima_actualizacion = new Date().toISOString();
                    }
                    
                    // Log de actividad
                    datosActuales.log_actividad.unshift({
                        tipo: 'nuevo_reporte',
                        mensaje: `Nuevo reporte en ${body.datos.ubicacion}`,
                        fecha: new Date().toISOString()
                    });

                } else if (body.tipo === 'actualizar_punto') {
                    const { puntoId, datos } = body;
                    const puntoIndex = datosActuales.puntos_reciclaje.findIndex(p => p.id === puntoId);
                    
                    if (puntoIndex !== -1) {
                        datosActuales.puntos_reciclaje[puntoIndex] = {
                            ...datosActuales.puntos_reciclaje[puntoIndex],
                            ...datos,
                            ultima_actualizacion: new Date().toISOString()
                        };
                    }
                }

                datosActuales.configuracion.ultima_actualizacion = new Date().toISOString();
                
                // Guardar cambios
                fs.writeFileSync(datosPath, JSON.stringify(datosActuales, null, 2));
                
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({ 
                        mensaje: 'Datos actualizados correctamente',
                        datos: datosActuales 
                    })
                };
                
            default:
                return {
                    statusCode: 405,
                    headers,
                    body: JSON.stringify({ error: 'Método no permitido' })
                };
        }
    } catch (error) {
        console.error('Error en API:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Error interno del servidor: ' + error.message })
        };
    }
};