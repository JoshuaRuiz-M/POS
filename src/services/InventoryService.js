/**
 * [DOM-INV] Servicio de Inventario
 * Gestión de productos, stock y alertas de inventario
 */

import { obtenerDatosProductos } from '../data/productos'
import LocalStorageEngine from './LocalStorageEngine'

class InventoryService {
    /**
     * Inicializa productos de demostración
     */
    static initDemoData() {
        const existentes = LocalStorageEngine.get('productos') || []
        if (existentes.length > 0) {
            return { estado: 'exito', datos: existentes, mensaje: 'Productos ya inicializados' }
        }

        const productosDemo = obtenerDatosProductos()

        LocalStorageEngine.set('productos', productosDemo)
        return { estado: 'exito', datos: productosDemo, mensaje: 'Datos demo inicializados' }
    }

    /**
     * Obtiene todos los productos
     */
    static obtenerProductos() {
        const productos = (LocalStorageEngine.get('productos') || []).filter(producto => producto.eliminado !== true)
        return { estado: 'exito', datos: productos, mensaje: 'Productos cargados' }
    }

    static obtenerTodosLosProductos({ incluirEliminados = false } = {}) {
        const productos = LocalStorageEngine.get('productos') || []
        return {
            estado: 'exito',
            datos: productos.filter(producto => incluirEliminados ? true : producto.eliminado !== true),
            mensaje: 'Productos cargados',
        }
    }

    /**
     * Busca productos por término
     */
    static buscarProductos(termino) {
        const productos = LocalStorageEngine.get('productos') || []
        const resultado = productos.filter(p =>
            p.nombre.toLowerCase().includes(termino.toLowerCase()) ||
            p.codigo.includes(termino) ||
            p.sku.toLowerCase().includes(termino.toLowerCase())
        )
        return { estado: 'exito', datos: resultado, mensaje: `${resultado.length} productos encontrados` }
    }

    /**
     * Obtiene producto por ID
     */
    static obtenerProducto(id) {
        const productos = LocalStorageEngine.get('productos') || []
        const producto = productos.find(p => p.id === id)

        if (!producto) {
            return { estado: 'error', datos: null, mensaje: 'Producto no encontrado' }
        }

        return { estado: 'exito', datos: producto, mensaje: 'Producto encontrado' }
    }

    static crearProducto(datos) {
        const productos = LocalStorageEngine.get('productos') || []

        const nuevoProducto = {
            id: `PRD_${Date.now()}`,
            codigo: datos.codigo,
            nombre: datos.nombre,
            precio: parseFloat(datos.precio),
            stock: parseInt(datos.stock) || 0,
            stockMinimo: parseInt(datos.stockMinimo) || 5,
            categoria: datos.categoria,
            sku: datos.sku,
            descripcion: datos.descripcion || '',
            activo: true,
            eliminado: false,
            tipo: 'PRODUCTO',
            creadoEn: new Date().toISOString(),
        }

        productos.push(nuevoProducto)
        LocalStorageEngine.set('productos', productos)

        return {
            estado: 'exito',
            datos: nuevoProducto,
            mensaje: 'Producto creado exitosamente',
        }
    }

    static actualizarProducto(id, datos) {
        const productos = LocalStorageEngine.get('productos') || []
        const producto = productos.find(item => item.id === id)

        if (!producto) {
            return { estado: 'error', datos: null, mensaje: 'Producto no encontrado' }
        }

        Object.assign(producto, {
            ...datos,
            precio: datos.precio !== undefined ? parseFloat(datos.precio) || 0 : producto.precio,
            stock: datos.stock !== undefined ? parseInt(datos.stock) || 0 : producto.stock,
            stockMinimo: datos.stockMinimo !== undefined ? parseInt(datos.stockMinimo) || 0 : producto.stockMinimo,
        })

        LocalStorageEngine.set('productos', productos)

        return { estado: 'exito', datos: producto, mensaje: 'Producto actualizado exitosamente' }
    }

    static eliminarProducto(id) {
        const productos = LocalStorageEngine.get('productos') || []
        const producto = productos.find(item => item.id === id)
        if (!producto) return { estado: 'error', datos: null, mensaje: 'Producto no encontrado' }
        producto.eliminado = true
        producto.activo = false
        producto.eliminadoEn = new Date().toISOString()
        LocalStorageEngine.set('productos', productos)
        return { estado: 'exito', datos: producto, mensaje: 'Producto eliminado lógicamente' }
    }

    static restaurarProducto(id) {
        const productos = LocalStorageEngine.get('productos') || []
        const producto = productos.find(item => item.id === id)
        if (!producto) return { estado: 'error', datos: null, mensaje: 'Producto no encontrado' }
        producto.eliminado = false
        producto.activo = true
        producto.restauradoEn = new Date().toISOString()
        LocalStorageEngine.set('productos', productos)
        return { estado: 'exito', datos: producto, mensaje: 'Producto restaurado exitosamente' }
    }

    /**
     * Actualiza stock del producto
     */
    static actualizarStock(productoId, cantidad) {
        const productos = LocalStorageEngine.get('productos') || []
        const producto = productos.find(p => p.id === productoId)

        if (!producto) {
            return { estado: 'error', datos: null, mensaje: 'Producto no encontrado' }
        }

        if (producto.stock + cantidad < 0) {
            return { estado: 'error', datos: null, mensaje: 'Stock insuficiente' }
        }

        producto.stock += cantidad
        LocalStorageEngine.set('productos', productos)

        return {
            estado: 'exito',
            datos: producto,
            mensaje: `Stock actualizado. Nuevo stock: ${producto.stock}`,
        }
    }

    /**
     * Obtiene alertas de productos con stock bajo
     */
    static obtenerAlertasStock() {
        const productos = LocalStorageEngine.get('productos') || []
        const alertas = productos
            .filter(p => p.stock <= p.stockMinimo)
            .map(p => ({
                id: `ALT_${p.id}`,
                productoId: p.id,
                nombre: p.nombre,
                stock: p.stock,
                stockMinimo: p.stockMinimo,
                tipo: p.stock === 0 ? 'AGOTADO' : 'BAJO',
            }))

        return {
            estado: 'exito',
            datos: alertas,
            mensaje: `${alertas.length} alertas de inventario`,
        }
    }

    /**
     * Obtiene productos de alta rotación (para BI)
     */
    static obtenerRankingProductos() {
        const ventas = LocalStorageEngine.get('ventas') || []
        const ranking = {}

        ventas.forEach(venta => {
            venta.detalles.forEach(detalle => {
                if (!ranking[detalle.productoId]) {
                    ranking[detalle.productoId] = { ...detalle, cantidadVendida: 0 }
                }
                ranking[detalle.productoId].cantidadVendida += detalle.cantidad
            })
        })

        const rankingOrdenado = Object.values(ranking)
            .sort((a, b) => b.cantidadVendida - a.cantidadVendida)
            .slice(0, 5)

        return {
            estado: 'exito',
            datos: rankingOrdenado,
            mensaje: 'Ranking de productos por rotación',
        }
    }

}

export default InventoryService
