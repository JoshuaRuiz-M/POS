/**
 * [DOM-POS] Punto de venta con catálogo mixto
 */

import { useEffect, useState } from 'react'
import { Search, Trash2, CheckCircle } from 'lucide-react'
import { useApp } from '../context/AppContext'
import InventoryService from '../services/InventoryService'
import ServiceCatalogService from '../services/ServiceCatalogService'
import SalesService from '../services/SalesService'
import ClientService from '../services/ClientService'
import { formatearGTQ } from '../utils/formatters'

export function POSPage() {
    const { usuario, agregarNotificacion } = useApp()
    const [termino, setTermino] = useState('')
    const [elementos, setElementos] = useState([])
    const [carrito, setCarrito] = useState(SalesService.obtenerCarrito())
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null)
    const [clientes, setClientes] = useState([])
    const [montoRecibido, setMontoRecibido] = useState('')
    const [mostrarClientes, setMostrarClientes] = useState(false)
    const [finalizando, setFinalizando] = useState(false)

    useEffect(() => {
        cargarCatalogo()
        cargarClientes()
    }, [])

    useEffect(() => {
        if (termino.trim().length > 0) {
            const resProductos = InventoryService.buscarProductos(termino)
            const resServicios = ServiceCatalogService.buscarServicios(termino)
            setElementos([
                ...(resProductos.datos || []).map(item => ({ ...item, tipo: 'PRODUCTO' })),
                ...(resServicios.datos || []).map(item => ({ ...item, tipo: 'SERVICIO' })),
            ])
        } else {
            cargarCatalogo()
        }
    }, [termino])

    const cargarCatalogo = () => {
        const resProductos = InventoryService.obtenerProductos()
        const resServicios = ServiceCatalogService.obtenerServicios()
        setElementos([
            ...(resProductos.datos || []).map(item => ({ ...item, tipo: 'PRODUCTO' })),
            ...(resServicios.datos || []).map(item => ({ ...item, tipo: 'SERVICIO' })),
        ])
    }

    const cargarClientes = () => {
        const res = ClientService.obtenerClientes()
        setClientes(res.datos || [])
    }

    const agregarAlCarrito = (item) => {
        const res = item.tipo === 'SERVICIO'
            ? SalesService.agregarServicioCarrito(item.id, 1)
            : SalesService.agregarProductoCarrito(item.id, 1)

        if (res.estado === 'exito') {
            setCarrito(res.datos)
            setTermino('')
            agregarNotificacion(`${item.nombre} agregado`, 'exito')
        } else {
            agregarNotificacion(res.mensaje, 'error')
        }
    }

    const eliminarDelCarrito = (itemId) => {
        const res = SalesService.eliminarProductoCarrito(itemId)
        setCarrito(res.datos)
        agregarNotificacion('Elemento removido', 'info')
    }

    const asignarCliente = (cliente) => {
        const res = SalesService.asignarClienteCarrito(cliente.id, cliente.nombre)
        setCarrito(res.datos)
        setClienteSeleccionado(cliente)
        setMostrarClientes(false)
        agregarNotificacion(`Cliente: ${cliente.nombre}`, 'exito')
    }

    const finalizarVenta = () => {
        if (carrito.detalles.length === 0) {
            agregarNotificacion('Carrito vacío', 'error')
            return
        }

        const monto = parseFloat(montoRecibido)
        if (!monto || monto <= 0) {
            agregarNotificacion('Monto inválido', 'error')
            return
        }

        setFinalizando(true)
        setTimeout(() => {
            const res = SalesService.finalizarVenta(monto, usuario)

            if (res.estado === 'exito') {
                agregarNotificacion(`Venta ${res.datos.numero} registrada`, 'exito')
                setCarrito(SalesService.crearCarritoVacio())
                setClienteSeleccionado(null)
                setMontoRecibido('')
                setTermino('')
            } else {
                agregarNotificacion(res.mensaje, 'error')
            }

            setFinalizando(false)
        }, 500)
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            <div className="lg:col-span-2 space-y-4">
                <h1 className="text-2xl font-bold text-gray-900">Punto de Venta</h1>

                <div className="relative">
                    <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar producto o servicio por nombre, código o descripción..."
                        value={termino}
                        onChange={(e) => setTermino(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        autoFocus
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[32rem] overflow-y-auto">
                    {elementos.map(item => (
                        <button
                            key={`${item.tipo}-${item.id}`}
                            onClick={() => agregarAlCarrito(item)}
                            disabled={item.tipo === 'PRODUCTO' && item.stock === 0}
                            className="p-4 text-left bg-white border border-gray-200 rounded-lg hover:border-primary hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <p className="font-semibold text-gray-900">{item.nombre}</p>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${item.tipo === 'SERVICIO'
                                    ? 'bg-purple-100 text-purple-700'
                                    : item.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                    {item.tipo === 'SERVICIO' ? 'SERVICIO' : `${item.stock} unid.`}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{item.tipo === 'SERVICIO' ? item.descripcion : item.sku}</p>
                            <p className="font-bold text-primary">{formatearGTQ(item.precio)}</p>
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 h-fit sticky top-4">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Carrito</h2>

                <div className="mb-4 pb-4 border-b border-gray-200">
                    <button
                        onClick={() => setMostrarClientes(!mostrarClientes)}
                        className="w-full p-2 text-left bg-gray-50 hover:bg-gray-100 rounded border border-gray-300"
                    >
                        <p className="text-xs text-gray-600">Cliente</p>
                        <p className="font-medium text-gray-900">{clienteSeleccionado?.nombre || 'Sin cliente'}</p>
                    </button>

                    {mostrarClientes && (
                        <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                            {clientes.map(cliente => (
                                <button
                                    key={cliente.id}
                                    onClick={() => asignarCliente(cliente)}
                                    className="w-full text-left p-2 text-sm hover:bg-gray-100 rounded"
                                >
                                    {cliente.nombre}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="space-y-2 mb-4 max-h-40 overflow-y-auto border-b border-gray-200 pb-4">
                    {carrito.detalles.map(detalle => (
                        <div key={`${detalle.tipo}-${detalle.itemId}`} className="flex justify-between items-start text-sm">
                            <div className="flex-1">
                                <p className="font-medium text-gray-900">{detalle.nombre}</p>
                                <p className="text-gray-600">{detalle.cantidad} x {formatearGTQ(detalle.precio)} {detalle.tipo === 'SERVICIO' ? '(Servicio)' : '(Producto)'}</p>
                            </div>
                            <button
                                onClick={() => eliminarDelCarrito(detalle.itemId)}
                                className="text-red-600 hover:text-red-700 ml-2 flex-shrink-0"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>

                <div className="space-y-2 mb-4 text-sm">
                    <div className="flex justify-between text-gray-600">
                        <span>Subtotal:</span>
                        <span>{formatearGTQ(carrito.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <span>IVA (12% GT):</span>
                        <span>{formatearGTQ(carrito.impuesto)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                        <span>Total:</span>
                        <span>{formatearGTQ(carrito.total)}</span>
                    </div>
                </div>

                <div className="mb-4">
                    <label className="text-sm font-medium text-gray-700">Monto Recibido</label>
                    <input
                        type="number"
                        value={montoRecibido}
                        onChange={(e) => setMontoRecibido(e.target.value)}
                        placeholder="0.00"
                        className="w-full mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    {montoRecibido && (
                        <p className="text-sm mt-2 text-gray-600">Cambio: {formatearGTQ(parseFloat(montoRecibido) - carrito.total)}</p>
                    )}
                </div>

                <button
                    onClick={finalizarVenta}
                    disabled={finalizando || carrito.detalles.length === 0 || !montoRecibido || carrito.clienteId === null || parseFloat(montoRecibido) < carrito.total}
                    className="w-full bg-success hover:bg-green-600 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    <CheckCircle size={20} />
                    {finalizando ? 'Procesando...' : 'Finalizar Venta'}
                </button>
            </div>
        </div>
    )
}
