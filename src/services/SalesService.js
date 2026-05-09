/**
 * [DOM-POS] Servicio de Ventas y [DOM-PAGOS] Pagos
 * Gestión de transacciones, pagos y créditos
 */

import LocalStorageEngine from './LocalStorageEngine'
import InventoryService from './InventoryService'
import ServiceCatalogService from './ServiceCatalogService'

export const ESTADOS_VENTA = {
    PAGADA: 'PAGADA',
    SALDO_PENDIENTE: 'SALDO_PENDIENTE',
    ANULADA: 'ANULADA',
}

const IVA_GT = 0.12

class SalesService {
    /**
     * Obtiene carrito de venta actual (temporal en sesión)
     */
    static obtenerCarrito() {
        const carrito = sessionStorage.getItem('CARRITO_ACTUAL')
        return carrito ? JSON.parse(carrito) : this.crearCarritoVacio()
    }

    /**
     * Crea carrito vacío
     */
    static crearCarritoVacio() {
        return {
            id: `CARR_${Date.now()}`,
            detalles: [],
            clienteId: null,
            clienteNombre: '',
            usuarioId: null,
            usuarioNombre: '',
            subtotal: 0,
            impuesto: 0,
            total: 0,
        }
    }

    /**
     * Persiste carrito en sesión
     */
    static guardarCarrito(carrito) {
        sessionStorage.setItem('CARRITO_ACTUAL', JSON.stringify(carrito))
    }

    /**
     * Agrega producto al carrito
     */
    static agregarItemCarrito(itemId, tipo = 'PRODUCTO', cantidad = 1) {
        const resItem = tipo === 'SERVICIO'
            ? ServiceCatalogService.obtenerServicio(itemId)
            : InventoryService.obtenerProducto(itemId)

        if (resItem.estado !== 'exito') {
            return resItem
        }

        const item = resItem.datos
        if (tipo === 'PRODUCTO' && item.stock < cantidad) {
            return {
                estado: 'error',
                datos: null,
                mensaje: 'Stock insuficiente para esta cantidad',
            }
        }

        const carrito = this.obtenerCarrito()
        const detalleExistente = carrito.detalles.find(d => d.itemId === itemId && d.tipo === tipo)

        if (detalleExistente) {
            detalleExistente.cantidad += cantidad
            detalleExistente.subtotal = detalleExistente.precio * detalleExistente.cantidad
        } else {
            carrito.detalles.push({
                itemId,
                tipo,
                nombre: item.nombre,
                precio: item.precio,
                cantidad,
                subtotal: item.precio * cantidad,
            })
        }

        this.recalcularCarrito(carrito)
        this.guardarCarrito(carrito)

        return {
            estado: 'exito',
            datos: carrito,
            mensaje: 'Producto agregado al carrito',
        }
    }

    static agregarProductoCarrito(productoId, cantidad = 1) {
        return this.agregarItemCarrito(productoId, 'PRODUCTO', cantidad)
    }

    static agregarServicioCarrito(servicioId, cantidad = 1) {
        return this.agregarItemCarrito(servicioId, 'SERVICIO', cantidad)
    }

    /**
     * Elimina producto del carrito
     */
    static eliminarProductoCarrito(productoId) {
        const carrito = this.obtenerCarrito()
        carrito.detalles = carrito.detalles.filter(d => d.itemId !== productoId)
        this.recalcularCarrito(carrito)
        this.guardarCarrito(carrito)

        return {
            estado: 'exito',
            datos: carrito,
            mensaje: 'Producto removido del carrito',
        }
    }

    /**
     * Recalcula totales del carrito
     */
    static recalcularCarrito(carrito) {
        carrito.subtotal = carrito.detalles.reduce((sum, d) => sum + d.subtotal, 0)
        carrito.impuesto = carrito.subtotal * IVA_GT
        carrito.total = carrito.subtotal + carrito.impuesto
    }

    /**
     * Asigna cliente al carrito
     */
    static asignarClienteCarrito(clienteId, clienteNombre = '') {
        const carrito = this.obtenerCarrito()
        carrito.clienteId = clienteId
        carrito.clienteNombre = clienteNombre
        this.guardarCarrito(carrito)

        return {
            estado: 'exito',
            datos: carrito,
            mensaje: 'Cliente asignado al carrito',
        }
    }

    static asignarUsuarioCarrito(usuarioId, usuarioNombre = '') {
        const carrito = this.obtenerCarrito()
        carrito.usuarioId = usuarioId
        carrito.usuarioNombre = usuarioNombre
        this.guardarCarrito(carrito)

        return {
            estado: 'exito',
            datos: carrito,
            mensaje: 'Usuario asignado al carrito',
        }
    }

    /**
     * Finaliza venta
     */
    static finalizarVenta(montoRecibido, usuario) {
        const carrito = this.obtenerCarrito()

        if (carrito.detalles.length === 0) {
            return {
                estado: 'error',
                datos: null,
                mensaje: 'Carrito vacío',
            }
        }

        // Validar stock antes de procesar
        for (const detalle of carrito.detalles) {
            if (detalle.tipo !== 'PRODUCTO') continue
            const resProducto = InventoryService.obtenerProducto(detalle.itemId)
            if (resProducto.estado !== 'exito' || resProducto.datos.stock < detalle.cantidad) {
                return {
                    estado: 'error',
                    datos: null,
                    mensaje: `Stock insuficiente para ${detalle.nombre}`,
                }
            }
        }

        // Determinar estado de pago
        const estado = montoRecibido >= carrito.total
            ? ESTADOS_VENTA.PAGADA
            : ESTADOS_VENTA.SALDO_PENDIENTE

        // Crear registro de venta
        const venta = {
            id: `VTA_${Date.now()}`,
            numero: `VTA-${new Date().toISOString().slice(0, 10)}-${Date.now() % 10000}`,
            fecha: new Date().toISOString(),
            detalles: [...carrito.detalles],
            subtotal: carrito.subtotal,
            impuesto: carrito.impuesto,
            total: carrito.total,
            montoRecibido: parseFloat(montoRecibido),
            cambio: Math.max(0, montoRecibido - carrito.total),
            estado,
            clienteId: carrito.clienteId,
            clienteNombre: carrito.clienteNombre,
            saldoPendiente: Math.max(0, carrito.total - montoRecibido),
            usuarioId: usuario?.id || carrito.usuarioId || null,
            usuarioNombre: usuario?.nombre || carrito.usuarioNombre || 'Sistema',
            usuarioRol: usuario?.rol || null,
        }

        // Actualizar stock
        for (const detalle of carrito.detalles) {
            if (detalle.tipo === 'PRODUCTO') {
                InventoryService.actualizarStock(detalle.itemId, -detalle.cantidad)
            }
        }

        // Registrar venta
        const ventas = LocalStorageEngine.get('ventas') || []
        ventas.push(venta)
        LocalStorageEngine.set('ventas', ventas)

        // Actualizar cartera si hay saldo pendiente
        if (estado === ESTADOS_VENTA.SALDO_PENDIENTE && carrito.clienteId) {
            this.registrarDeuda(carrito.clienteId, carrito.clienteNombre, venta.saldoPendiente)
        }

        // Limpiar carrito
        sessionStorage.removeItem('CARRITO_ACTUAL')

        return {
            estado: 'exito',
            datos: venta,
            mensaje: `Venta registrada: ${venta.numero}`,
        }
    }

    /**
     * Anula venta (rollback atómico)
     */
    static anularVenta(ventaId) {
        const ventas = LocalStorageEngine.get('ventas') || []
        const venta = ventas.find(v => v.id === ventaId)

        if (!venta) {
            return { estado: 'error', datos: null, mensaje: 'Venta no encontrada' }
        }

        if (venta.estado === ESTADOS_VENTA.ANULADA) {
            return { estado: 'error', datos: null, mensaje: 'Venta ya ha sido anulada' }
        }

        // Rollback atómico: restaurar stock
        for (const detalle of venta.detalles) {
            if (detalle.tipo === 'PRODUCTO') {
                InventoryService.actualizarStock(detalle.itemId, detalle.cantidad)
            }
        }

        // Cambiar estado
        venta.estado = ESTADOS_VENTA.ANULADA
        venta.fechaAnulacion = new Date().toISOString()

        LocalStorageEngine.set('ventas', ventas)

        return {
            estado: 'exito',
            datos: venta,
            mensaje: 'Venta anulada y stock restaurado',
        }
    }

    /**
     * Obtiene historial de ventas
     */
    static obtenerHistorialVentas(limite = 50) {
        const ventas = LocalStorageEngine.get('ventas') || []
        return {
            estado: 'exito',
            datos: ventas.slice(-limite).reverse(),
            mensaje: 'Historial de ventas cargado',
        }
    }

    static obtenerVentas(filtros = {}, usuarioActual = null) {
        const ventas = LocalStorageEngine.get('ventas') || []
        const esAdmin = usuarioActual?.rol === 'ADMIN'
        const { usuarioId, desde, hasta, estado } = filtros

        const resultado = ventas.filter(venta => {
            const fecha = new Date(venta.fecha)
            const coincideUsuario = esAdmin ? (!usuarioId || venta.usuarioId === usuarioId) : venta.usuarioId === usuarioActual?.id
            const coincideDesde = !desde || fecha >= new Date(desde)
            const coincideHasta = !hasta || fecha <= new Date(hasta)
            const coincideEstado = !estado || venta.estado === estado
            return coincideUsuario && coincideDesde && coincideHasta && coincideEstado
        })

        return {
            estado: 'exito',
            datos: resultado.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)),
            mensaje: 'Ventas cargadas',
        }
    }

    static obtenerResumenVentas(filtros = {}, usuarioActual = null) {
        const ventas = this.obtenerVentas(filtros, usuarioActual).datos || []
        const activas = ventas.filter(venta => venta.estado !== ESTADOS_VENTA.ANULADA)

        const resumen = activas.reduce((acc, venta) => ({
            cantidad: acc.cantidad + 1,
            total: acc.total + venta.total,
            credito: acc.credito + (venta.estado === ESTADOS_VENTA.SALDO_PENDIENTE ? venta.saldoPendiente : 0),
            efectivo: acc.efectivo + (venta.estado === ESTADOS_VENTA.PAGADA ? venta.montoRecibido : 0),
        }), { cantidad: 0, total: 0, credito: 0, efectivo: 0 })

        return {
            estado: 'exito',
            datos: resumen,
            mensaje: 'Resumen de ventas calculado',
        }
    }

    /**
     * Registra deuda de cliente
     */
    static registrarDeuda(clienteId, clienteNombre, monto) {
        const cartera = LocalStorageEngine.get('cartera') || []

        const deuda = cartera.find(c => c.clienteId === clienteId)
        if (deuda) {
            deuda.saldoPendiente += monto
            deuda.ultimaActualizacion = new Date().toISOString()
        } else {
            cartera.push({
                id: `DUD_${Date.now()}`,
                clienteId,
                clienteNombre,
                saldoPendiente: monto,
                fechaCreacion: new Date().toISOString(),
                ultimaActualizacion: new Date().toISOString(),
            })
        }

        LocalStorageEngine.set('cartera', cartera)
    }

    /**
     * Obtiene cartera de clientes morosos
     */
    static obtenerCarteraClientes() {
        const cartera = LocalStorageEngine.get('cartera') || []
        return {
            estado: 'exito',
            datos: cartera.sort((a, b) => b.saldoPendiente - a.saldoPendiente),
            mensaje: 'Cartera de clientes cargada',
        }
    }

    /**
     * Obtiene métricas de ventas diarias
     */
    static obtenerVentasDiarias(fecha = new Date().toISOString().slice(0, 10)) {
        const ventas = LocalStorageEngine.get('ventas') || []
        const ventasDelDia = ventas.filter(
            v => v.fecha.slice(0, 10) === fecha && v.estado !== ESTADOS_VENTA.ANULADA
        )

        const totales = ventasDelDia.reduce(
            (acc, v) => ({
                cantidadVentas: acc.cantidadVentas + 1,
                totalVentas: acc.totalVentas + v.total,
                totalEfectivo: acc.totalEfectivo + (v.estado === ESTADOS_VENTA.PAGADA ? v.montoRecibido : 0),
                totalCrédito: acc.totalCrédito + (v.estado === ESTADOS_VENTA.SALDO_PENDIENTE ? v.saldoPendiente : 0),
            }),
            {
                cantidadVentas: 0,
                totalVentas: 0,
                totalEfectivo: 0,
                totalCrédito: 0,
            }
        )

        return {
            estado: 'exito',
            datos: {
                fecha,
                ...totales,
            },
            mensaje: 'Ventas del día calculadas',
        }
    }
}

export default SalesService
