/**
 * [DOM-POS] / [DOM-INV] Catálogo de servicios
 */

import { obtenerDatosServicios } from '../data/servicios'
import LocalStorageEngine from './LocalStorageEngine'

class ServiceCatalogService {
    static initDemoData() {
        const servicios = LocalStorageEngine.get('servicios') || []
        if (servicios.length > 0) return { estado: 'exito', datos: servicios, mensaje: 'Servicios ya inicializados' }

        const demo = obtenerDatosServicios()
        LocalStorageEngine.set('servicios', demo)
        return { estado: 'exito', datos: demo, mensaje: 'Servicios demo inicializados' }
    }

    static obtenerServicios({ incluirEliminados = false } = {}) {
        const servicios = (LocalStorageEngine.get('servicios') || []).filter(servicio => incluirEliminados ? true : servicio.eliminado !== true)
        return { estado: 'exito', datos: servicios, mensaje: 'Servicios cargados' }
    }

    static obtenerServicio(id) {
        const servicios = LocalStorageEngine.get('servicios') || []
        const servicio = servicios.find(item => item.id === id)
        if (!servicio) return { estado: 'error', datos: null, mensaje: 'Servicio no encontrado' }
        return { estado: 'exito', datos: servicio, mensaje: 'Servicio encontrado' }
    }

    static crearServicio(datos) {
        const servicios = LocalStorageEngine.get('servicios') || []
        const nuevo = {
            id: `SRV_${Date.now()}`,
            codigo: datos.codigo || `SERV-${Date.now().toString().slice(-4)}`,
            nombre: datos.nombre,
            precio: parseFloat(datos.precio) || 0,
            categoria: datos.categoria || 'General',
            descripcion: datos.descripcion || '',
            activo: true,
            eliminado: false,
            creadoEn: new Date().toISOString(),
        }
        servicios.push(nuevo)
        LocalStorageEngine.set('servicios', servicios)
        return { estado: 'exito', datos: nuevo, mensaje: 'Servicio creado exitosamente' }
    }

    static actualizarServicio(id, datos) {
        const servicios = LocalStorageEngine.get('servicios') || []
        const servicio = servicios.find(item => item.id === id)
        if (!servicio) return { estado: 'error', datos: null, mensaje: 'Servicio no encontrado' }
        Object.assign(servicio, {
            ...datos,
            precio: datos.precio !== undefined ? parseFloat(datos.precio) || 0 : servicio.precio,
        })
        LocalStorageEngine.set('servicios', servicios)
        return { estado: 'exito', datos: servicio, mensaje: 'Servicio actualizado exitosamente' }
    }

    static eliminarServicio(id) {
        const servicios = LocalStorageEngine.get('servicios') || []
        const servicio = servicios.find(item => item.id === id)
        if (!servicio) return { estado: 'error', datos: null, mensaje: 'Servicio no encontrado' }
        servicio.eliminado = true
        servicio.activo = false
        servicio.eliminadoEn = new Date().toISOString()
        LocalStorageEngine.set('servicios', servicios)
        return { estado: 'exito', datos: servicio, mensaje: 'Servicio eliminado lógicamente' }
    }

    static restaurarServicio(id) {
        const servicios = LocalStorageEngine.get('servicios') || []
        const servicio = servicios.find(item => item.id === id)
        if (!servicio) return { estado: 'error', datos: null, mensaje: 'Servicio no encontrado' }
        servicio.eliminado = false
        servicio.activo = true
        servicio.restauradoEn = new Date().toISOString()
        LocalStorageEngine.set('servicios', servicios)
        return { estado: 'exito', datos: servicio, mensaje: 'Servicio restaurado exitosamente' }
    }

    static buscarServicios(termino) {
        const servicios = this.obtenerServicios().datos || []
        const resultado = servicios.filter(servicio =>
            servicio.nombre.toLowerCase().includes(termino.toLowerCase()) ||
            servicio.codigo.toLowerCase().includes(termino.toLowerCase()) ||
            servicio.descripcion.toLowerCase().includes(termino.toLowerCase())
        )
        return { estado: 'exito', datos: resultado, mensaje: `${resultado.length} servicios encontrados` }
    }
}

export default ServiceCatalogService