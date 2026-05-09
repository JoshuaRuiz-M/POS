export const obtenerDatosServicios = () => {
    return [
        { id: 'SRV_001', codigo: 'SERV-001', nombre: 'Diagnóstico de equipo', precio: 75, categoria: 'Soporte Técnico', descripcion: 'Revisión integral del equipo', activo: true, eliminado: false, creadoEn: new Date().toISOString() },
        { id: 'SRV_002', codigo: 'SERV-002', nombre: 'Instalación de software', precio: 50, categoria: 'Soporte Técnico', descripcion: 'Instalación y configuración básica', activo: true, eliminado: false, creadoEn: new Date().toISOString() },
        { id: 'SRV_003', codigo: 'SERV-003', nombre: 'Mantenimiento preventivo', precio: 125, categoria: 'Mantenimiento', descripcion: 'Limpieza, revisión y optimización', activo: true, eliminado: false, creadoEn: new Date().toISOString() },
    ]

}