/**
 * [DOM-PAGOS] Servicio de Clientes
 * Gestión de información de clientes y vinculación con deudas
 */


import { obtenerDatosClientes } from '../data/clientes'
import LocalStorageEngine from './LocalStorageEngine'

class ClientService {
    /**
     * Inicializa clientes de demostración
     */
    static initDemoData() {
        const existentes = LocalStorageEngine.get('clientes') || []
        if (existentes.length > 0) {
            return { estado: 'exito', datos: existentes, mensaje: 'Clientes ya inicializados' }
        }

        const clientesDemo = obtenerDatosClientes()

        LocalStorageEngine.set('clientes', clientesDemo)
        return { estado: 'exito', datos: clientesDemo, mensaje: 'Clientes demo inicializados' }
    }

    /**
     * Obtiene todos los clientes
     */
    static obtenerClientes() {
        const clientes = (LocalStorageEngine.get('clientes') || []).filter(cliente => cliente.eliminado !== true)
        return { estado: 'exito', datos: clientes, mensaje: 'Clientes cargados' }
    }

    static obtenerTodosLosClientes({ incluirEliminados = false } = {}) {
        const clientes = LocalStorageEngine.get('clientes') || []
        return {
            estado: 'exito',
            datos: clientes.filter(cliente => incluirEliminados ? true : cliente.eliminado !== true),
            mensaje: 'Clientes cargados',
        }
    }

    /**
     * Busca clientes por término
     */
    static buscarClientes(termino) {
        const clientes = LocalStorageEngine.get('clientes') || []
        const resultado = clientes.filter(c =>
            c.nombre.toLowerCase().includes(termino.toLowerCase()) ||
            c.nit.includes(termino) ||
            c.email.toLowerCase().includes(termino.toLowerCase())
        )
        return { estado: 'exito', datos: resultado, mensaje: `${resultado.length} clientes encontrados` }
    }

    /**
     * Obtiene cliente por ID
     */
    static obtenerCliente(id) {
        const clientes = LocalStorageEngine.get('clientes') || []
        const cliente = clientes.find(c => c.id === id)

        if (!cliente) {
            return { estado: 'error', datos: null, mensaje: 'Cliente no encontrado' }
        }

        return { estado: 'exito', datos: cliente, mensaje: 'Cliente encontrado' }
    }

    /**
     * Obtiene cliente con saldo pendiente
     */
    static obtenerClienteConSaldo(id) {
        const resCliente = this.obtenerCliente(id)
        if (resCliente.estado !== 'exito') return resCliente

        const cartera = LocalStorageEngine.get('cartera') || []
        const deuda = cartera.find(c => c.clienteId === id)

        const cliente = {
            ...resCliente.datos,
            saldoPendiente: deuda?.saldoPendiente || 0,
        }

        return { estado: 'exito', datos: cliente, mensaje: 'Cliente con saldo cargado' }
    }

    /**
     * Crea un nuevo cliente
     */
    static crearCliente(datos) {
        const clientes = LocalStorageEngine.get('clientes') || []

        // Validar NIT único
        if (clientes.some(c => c.nit === datos.nit)) {
            return { estado: 'error', datos: null, mensaje: 'NIT ya registrado' }
        }

        const nuevoCliente = {
            id: `CLI_${Date.now()}`,
            nombre: datos.nombre,
            nit: datos.nit,
            email: datos.email || '',
            telefono: datos.telefono || '',
            direccion: datos.direccion || '',
            ciudad: datos.ciudad || '',
            estado: 'ACTIVO',
            activo: true,
            eliminado: false,
            fechaRegistro: new Date().toISOString(),
        }

        clientes.push(nuevoCliente)
        LocalStorageEngine.set('clientes', clientes)

        return {
            estado: 'exito',
            datos: nuevoCliente,
            mensaje: 'Cliente creado exitosamente',
        }
    }

    /**
     * Actualiza cliente
     */
    static actualizarCliente(id, datos) {
        const clientes = LocalStorageEngine.get('clientes') || []
        const cliente = clientes.find(c => c.id === id)

        if (!cliente) {
            return { estado: 'error', datos: null, mensaje: 'Cliente no encontrado' }
        }

        // Validar NIT único (excepto el actual)
        if (datos.nit && datos.nit !== cliente.nit) {
            if (clientes.some(c => c.nit === datos.nit && c.id !== id)) {
                return { estado: 'error', datos: null, mensaje: 'NIT ya registrado' }
            }
        }

        Object.assign(cliente, datos)
        LocalStorageEngine.set('clientes', clientes)

        return {
            estado: 'exito',
            datos: cliente,
            mensaje: 'Cliente actualizado exitosamente',
        }
    }

    static eliminarCliente(id) {
        const clientes = LocalStorageEngine.get('clientes') || []
        const cliente = clientes.find(item => item.id === id)
        if (!cliente) return { estado: 'error', datos: null, mensaje: 'Cliente no encontrado' }
        cliente.eliminado = true
        cliente.activo = false
        cliente.eliminadoEn = new Date().toISOString()
        LocalStorageEngine.set('clientes', clientes)
        return { estado: 'exito', datos: cliente, mensaje: 'Cliente eliminado lógicamente' }
    }

    static restaurarCliente(id) {
        const clientes = LocalStorageEngine.get('clientes') || []
        const cliente = clientes.find(item => item.id === id)
        if (!cliente) return { estado: 'error', datos: null, mensaje: 'Cliente no encontrado' }
        cliente.eliminado = false
        cliente.activo = true
        cliente.restauradoEn = new Date().toISOString()
        LocalStorageEngine.set('clientes', clientes)
        return { estado: 'exito', datos: cliente, mensaje: 'Cliente restaurado exitosamente' }
    }

    /**
     * Obtiene historial de ventas de un cliente
     */
    static obtenerHistorialClienteVentas(clienteId) {
        const ventas = LocalStorageEngine.get('ventas') || []
        const ventasCliente = ventas.filter(v => v.clienteId === clienteId)

        return {
            estado: 'exito',
            datos: ventasCliente,
            mensaje: `${ventasCliente.length} ventas encontradas`,
        }
    }
}

export default ClientService
