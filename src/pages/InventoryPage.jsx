/**
 * [DOM-INV] Inventario y catálogo de servicios
 */

import { useEffect, useState } from 'react'
import { Plus, AlertTriangle, PencilLine, Trash2, RotateCcw } from 'lucide-react'
import { useApp } from '../context/AppContext'
import AuthService from '../services/AuthService'
import InventoryService from '../services/InventoryService'
import ServiceCatalogService from '../services/ServiceCatalogService'
import { formatearGTQ } from '../utils/formatters'

const PRODUCTO_BASE = {
    codigo: '',
    nombre: '',
    precio: '',
    stock: '',
    stockMinimo: '',
    categoria: '',
    sku: '',
    descripcion: '',
}

const SERVICIO_BASE = {
    codigo: '',
    nombre: '',
    precio: '',
    categoria: '',
    descripcion: '',
}

export function InventoryPage() {
    const { agregarNotificacion } = useApp()
    const esAdmin = AuthService.esAdmin()

    const [tabActiva, setTabActiva] = useState('productos')
    const [productos, setProductos] = useState([])
    const [servicios, setServicios] = useState([])
    const [mostrarForm, setMostrarForm] = useState(false)
    const [editandoId, setEditandoId] = useState(null)
    const [mostrarEliminados, setMostrarEliminados] = useState(false)
    const [formularioProducto, setFormularioProducto] = useState(PRODUCTO_BASE)
    const [formularioServicio, setFormularioServicio] = useState(SERVICIO_BASE)

    useEffect(() => {
        cargarDatos()
    }, [mostrarEliminados])

    const cargarDatos = () => {
        const resProductos = InventoryService.obtenerTodosLosProductos({ incluirEliminados: mostrarEliminados })
        const resServicios = ServiceCatalogService.obtenerServicios({ incluirEliminados: mostrarEliminados })
        setProductos(resProductos.datos || [])
        setServicios(resServicios.datos || [])
    }

    const resetForm = () => {
        setMostrarForm(false)
        setEditandoId(null)
        setFormularioProducto(PRODUCTO_BASE)
        setFormularioServicio(SERVICIO_BASE)
    }

    const alternarEstado = (item, tipo) => {
        const operacion = item.eliminado
            ? (tipo === 'producto' ? InventoryService.restaurarProducto(item.id) : ServiceCatalogService.restaurarServicio(item.id))
            : (tipo === 'producto' ? InventoryService.eliminarProducto(item.id) : ServiceCatalogService.eliminarServicio(item.id))

        agregarNotificacion(operacion.mensaje, operacion.estado)
        cargarDatos()
    }

    const editar = (item, tipo) => {
        setTabActiva(tipo === 'producto' ? 'productos' : 'servicios')
        setEditandoId(item.id)
        setMostrarForm(true)

        if (tipo === 'producto') {
            setFormularioProducto({
                codigo: item.codigo || '',
                nombre: item.nombre || '',
                precio: item.precio || '',
                stock: item.stock || '',
                stockMinimo: item.stockMinimo || '',
                categoria: item.categoria || '',
                sku: item.sku || '',
                descripcion: item.descripcion || '',
            })
        } else {
            setFormularioServicio({
                codigo: item.codigo || '',
                nombre: item.nombre || '',
                precio: item.precio || '',
                categoria: item.categoria || '',
                descripcion: item.descripcion || '',
            })
        }
    }

    const guardarProducto = (e) => {
        e.preventDefault()
        const payload = formularioProducto
        const res = editandoId
            ? InventoryService.actualizarProducto(editandoId, payload)
            : InventoryService.crearProducto(payload)

        if (res.estado === 'exito') {
            agregarNotificacion(res.mensaje, 'exito')
            cargarDatos()
            resetForm()
        } else {
            agregarNotificacion(res.mensaje, 'error')
        }
    }

    const guardarServicio = (e) => {
        e.preventDefault()
        const payload = formularioServicio
        const res = editandoId
            ? ServiceCatalogService.actualizarServicio(editandoId, payload)
            : ServiceCatalogService.crearServicio(payload)

        if (res.estado === 'exito') {
            agregarNotificacion(res.mensaje, 'exito')
            cargarDatos()
            resetForm()
        } else {
            agregarNotificacion(res.mensaje, 'error')
        }
    }

    const alertasProductos = productos.filter(item => item.activo !== false && item.stock <= item.stockMinimo)
    const catalogoActual = tabActiva === 'productos' ? productos : servicios

    if (!esAdmin) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <h1 className="text-2xl font-bold text-gray-900">Inventario</h1>
                <p className="text-gray-600 mt-2">Solo el administrador puede gestionar productos y servicios.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Inventario y Servicios</h1>
                    <p className="text-gray-600">Productos, catálogo de servicios y bajas lógicas</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <button onClick={() => setMostrarEliminados(prev => !prev)} className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200">
                        {mostrarEliminados ? 'Ocultar eliminados' : 'Ver eliminados'}
                    </button>
                    <button
                        onClick={() => {
                            setMostrarForm(true)
                            setEditandoId(null)
                        }}
                        className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
                    >
                        <Plus size={18} /> Nuevo registro
                    </button>
                </div>
            </div>

            <div className="flex gap-2 border-b border-gray-200">
                <button onClick={() => setTabActiva('productos')} className={`px-4 py-2 font-medium ${tabActiva === 'productos' ? 'border-b-2 border-primary text-primary' : 'text-gray-600'}`}>
                    Productos
                </button>
                <button onClick={() => setTabActiva('servicios')} className={`px-4 py-2 font-medium ${tabActiva === 'servicios' ? 'border-b-2 border-primary text-primary' : 'text-gray-600'}`}>
                    Servicios
                </button>
            </div>

            {mostrarForm && tabActiva === 'productos' && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-bold mb-4">{editandoId ? 'Editar producto' : 'Nuevo producto'}</h2>
                    <form onSubmit={guardarProducto} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(formularioProducto).map(([campo, valor]) => (
                            <input
                                key={campo}
                                value={valor}
                                onChange={(e) => setFormularioProducto(prev => ({ ...prev, [campo]: e.target.value }))}
                                placeholder={campo}
                                className="px-3 py-2 border rounded-lg"
                                type={campo === 'precio' || campo === 'stock' || campo === 'stockMinimo' ? 'number' : 'text'}
                                step={campo === 'precio' ? '0.01' : undefined}
                            />
                        ))}
                        <div className="md:col-span-2 flex gap-2">
                            <button className="px-4 py-2 rounded-lg bg-primary text-white">Guardar</button>
                            <button type="button" onClick={resetForm} className="px-4 py-2 rounded-lg bg-gray-100">Cancelar</button>
                        </div>
                    </form>
                </div>
            )}

            {mostrarForm && tabActiva === 'servicios' && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-bold mb-4">{editandoId ? 'Editar servicio' : 'Nuevo servicio'}</h2>
                    <form onSubmit={guardarServicio} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(formularioServicio).map(([campo, valor]) => (
                            <input
                                key={campo}
                                value={valor}
                                onChange={(e) => setFormularioServicio(prev => ({ ...prev, [campo]: e.target.value }))}
                                placeholder={campo}
                                className="px-3 py-2 border rounded-lg"
                                type={campo === 'precio' ? 'number' : 'text'}
                                step="0.01"
                            />
                        ))}
                        <div className="md:col-span-2 flex gap-2">
                            <button className="px-4 py-2 rounded-lg bg-primary text-white">Guardar</button>
                            <button type="button" onClick={resetForm} className="px-4 py-2 rounded-lg bg-gray-100">Cancelar</button>
                        </div>
                    </form>
                </div>
            )}

            {tabActiva === 'productos' && alertasProductos.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3 font-semibold text-gray-900">
                        <AlertTriangle size={18} className="text-yellow-600" /> Alertas de stock bajo
                    </div>
                    <div className="space-y-2 text-sm">
                        {alertasProductos.map(item => (
                            <div key={item.id}>{item.nombre}: {item.stock} / {item.stockMinimo}</div>
                        ))}
                    </div>
                </div>
            )}

            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Nombre</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Código</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Categoría</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Precio</th>
                            {tabActiva === 'productos' && <th className="px-4 py-3 text-left text-sm font-semibold">Stock</th>}
                            {tabActiva === 'productos' && <th className="px-4 py-3 text-left text-sm font-semibold">Mínimo</th>}
                            <th className="px-4 py-3 text-left text-sm font-semibold">Estado</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {catalogoActual.map(item => (
                            <tr key={item.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm font-medium">{item.nombre}</td>
                                <td className="px-4 py-3 text-sm">{item.codigo}</td>
                                <td className="px-4 py-3 text-sm">{item.categoria}</td>
                                <td className="px-4 py-3 text-sm">{formatearGTQ(item.precio)}</td>
                                {tabActiva === 'productos' && <td className="px-4 py-3 text-sm">{item.stock}</td>}
                                {tabActiva === 'productos' && <td className="px-4 py-3 text-sm">{item.stockMinimo}</td>}
                                <td className="px-4 py-3 text-sm">{item.eliminado ? 'Eliminado' : 'Activo'}</td>
                                <td className="px-4 py-3 text-sm">
                                    <div className="flex gap-2 flex-wrap">
                                        <button onClick={() => editar(item, tabActiva === 'productos' ? 'producto' : 'servicio')} className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 flex items-center gap-1">
                                            <PencilLine size={14} /> Editar
                                        </button>
                                        <button onClick={() => alternarEstado(item, tabActiva === 'productos' ? 'producto' : 'servicio')} className={`px-3 py-1 rounded flex items-center gap-1 ${item.eliminado ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-red-50 text-red-700 hover:bg-red-100'}`}>
                                            {item.eliminado ? <RotateCcw size={14} /> : <Trash2 size={14} />}
                                            {item.eliminado ? 'Restaurar' : 'Eliminar'}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
