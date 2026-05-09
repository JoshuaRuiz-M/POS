/**
 * [DOM-PAGOS] Clientes con CRUD y bajas lógicas
 */

import { useEffect, useState } from 'react'
import { Plus, Eye, PencilLine, Trash2, RotateCcw } from 'lucide-react'
import { useApp } from '../context/AppContext'
import AuthService from '../services/AuthService'
import ClientService from '../services/ClientService'
import SalesService from '../services/SalesService'
import { formatearGTQ, formatearFechaCortaGT } from '../utils/formatters'

const CLIENTE_BASE = {
    nombre: '',
    nit: '',
    email: '',
    telefono: '',
    direccion: '',
    ciudad: '',
}

export function ClientsPage() {
    const { agregarNotificacion } = useApp()
    const esAdmin = AuthService.esAdmin()
    const [clientes, setClientes] = useState([])
    const [mostrarForm, setMostrarForm] = useState(false)
    const [mostrarEliminados, setMostrarEliminados] = useState(false)
    const [editandoId, setEditandoId] = useState(null)
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null)
    const [historialVentas, setHistorialVentas] = useState([])
    const [formulario, setFormulario] = useState(CLIENTE_BASE)

    useEffect(() => {
        cargarClientes()
    }, [mostrarEliminados])

    const cargarClientes = () => {
        const res = ClientService.obtenerTodosLosClientes({ incluirEliminados: mostrarEliminados })
        setClientes(res.datos || [])
    }

    const resetForm = () => {
        setFormulario(CLIENTE_BASE)
        setEditandoId(null)
        setMostrarForm(false)
    }

    const guardarCliente = (e) => {
        e.preventDefault()
        const res = editandoId
            ? ClientService.actualizarCliente(editandoId, formulario)
            : ClientService.crearCliente(formulario)

        if (res.estado === 'exito') {
            agregarNotificacion(res.mensaje, 'exito')
            cargarClientes()
            resetForm()
        } else {
            agregarNotificacion(res.mensaje, 'error')
        }
    }

    const editar = (item) => {
        setEditandoId(item.id)
        setMostrarForm(true)
        setFormulario({
            nombre: item.nombre || '',
            nit: item.nit || '',
            email: item.email || '',
            telefono: item.telefono || '',
            direccion: item.direccion || '',
            ciudad: item.ciudad || '',
        })
    }

    const alternarEstado = (item) => {
        const res = item.eliminado ? ClientService.restaurarCliente(item.id) : ClientService.eliminarCliente(item.id)
        agregarNotificacion(res.mensaje, res.estado)
        cargarClientes()
    }

    const verDetalles = (cliente) => {
        setClienteSeleccionado(cliente)
        const resVentas = SalesService.obtenerVentas({ usuarioId: '', estado: '' }, { rol: 'ADMIN', id: 'ADMIN' })
        setHistorialVentas((resVentas.datos || []).filter(venta => venta.clienteId === cliente.id))
    }

    const cartera = SalesService.obtenerCarteraClientes().datos || []
    const clientesConDeuda = clientes.map(cliente => ({
        ...cliente,
        saldoPendiente: cartera.find(ct => ct.clienteId === cliente.id)?.saldoPendiente || 0,
    }))

    if (!esAdmin) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
                <p className="text-gray-600 mt-2">La gestión de clientes está reservada para el administrador.</p>
                <p className="text-sm text-gray-500 mt-1">Puedes consultar información operativa desde las ventas.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
                    <p className="text-gray-600">CRUD completo con bajas lógicas</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <button onClick={() => setMostrarEliminados(prev => !prev)} className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200">
                        {mostrarEliminados ? 'Ocultar eliminados' : 'Ver eliminados'}
                    </button>
                    <button onClick={() => { setMostrarForm(true); setEditandoId(null); setFormulario(CLIENTE_BASE) }} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90">
                        <Plus size={18} /> Nuevo cliente
                    </button>
                </div>
            </div>

            {mostrarForm && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-bold mb-4">{editandoId ? 'Editar cliente' : 'Nuevo cliente'}</h2>
                    <form onSubmit={guardarCliente} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(formulario).map(([campo, valor]) => (
                            <input
                                key={campo}
                                value={valor}
                                onChange={(e) => setFormulario(prev => ({ ...prev, [campo]: e.target.value }))}
                                placeholder={campo}
                                className="px-3 py-2 border rounded-lg"
                                type={campo === 'email' ? 'email' : 'text'}
                            />
                        ))}
                        <div className="md:col-span-2 flex gap-2">
                            <button className="px-4 py-2 rounded-lg bg-primary text-white">Guardar</button>
                            <button type="button" onClick={resetForm} className="px-4 py-2 rounded-lg bg-gray-100">Cancelar</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Nombre</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">NIT</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Ciudad</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Saldo</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Estado</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {clientesConDeuda.map(cliente => (
                            <tr key={cliente.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm font-medium">{cliente.nombre}</td>
                                <td className="px-4 py-3 text-sm">{cliente.nit}</td>
                                <td className="px-4 py-3 text-sm">{cliente.email}</td>
                                <td className="px-4 py-3 text-sm">{cliente.ciudad}</td>
                                <td className="px-4 py-3 text-sm font-semibold">{formatearGTQ(cliente.saldoPendiente)}</td>
                                <td className="px-4 py-3 text-sm">{cliente.eliminado ? 'Desactivado' : 'Activo'}</td>
                                <td className="px-4 py-3 text-sm">
                                    <div className="flex gap-2 flex-wrap">
                                        <button onClick={() => verDetalles(cliente)} className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 flex items-center gap-1">
                                            <Eye size={14} /> Ver
                                        </button>
                                        <button onClick={() => editar(cliente)} className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 flex items-center gap-1">
                                            <PencilLine size={14} /> Editar
                                        </button>
                                        <button onClick={() => alternarEstado(cliente)} className={`px-3 py-1 rounded flex items-center gap-1 ${cliente.eliminado ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-red-50 text-red-700 hover:bg-red-100'}`}>
                                            {cliente.eliminado ? <RotateCcw size={14} /> : <Trash2 size={14} />}
                                            {cliente.eliminado ? 'Restaurar' : 'Eliminar'}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {clienteSeleccionado && (
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-xl font-bold">{clienteSeleccionado.nombre}</h2>
                            <p className="text-sm text-gray-600">NIT {clienteSeleccionado.nit}</p>
                        </div>
                        <button onClick={() => setClienteSeleccionado(null)} className="text-gray-500">Cerrar</button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div><span className="text-gray-500">Teléfono</span><p>{clienteSeleccionado.telefono || '-'}</p></div>
                        <div><span className="text-gray-500">Dirección</span><p>{clienteSeleccionado.direccion || '-'}</p></div>
                        <div><span className="text-gray-500">Ciudad</span><p>{clienteSeleccionado.ciudad || '-'}</p></div>
                        <div><span className="text-gray-500">Saldo</span><p className="font-semibold">{formatearGTQ(clienteSeleccionado.saldoPendiente || 0)}</p></div>
                    </div>
                    <div className="mt-6">
                        <h3 className="font-semibold mb-3">Ventas asociadas</h3>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {historialVentas.length > 0 ? historialVentas.map(venta => (
                                <div key={venta.id} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">{venta.numero}</p>
                                        <p className="text-xs text-gray-600">{formatearFechaCortaGT(venta.fecha)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">{formatearGTQ(venta.total)}</p>
                                        <p className="text-xs text-gray-600">{venta.estado}</p>
                                    </div>
                                </div>
                            )) : <p className="text-gray-600">Sin ventas registradas</p>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
