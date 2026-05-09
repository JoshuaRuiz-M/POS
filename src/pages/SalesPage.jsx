/**
 * [DOM-POS] Vista de ventas con filtros por usuario
 */

import { useEffect, useMemo, useState } from 'react'
import { Filter, RefreshCcw } from 'lucide-react'
import { useApp } from '../context/AppContext'
import SalesService, { ESTADOS_VENTA } from '../services/SalesService'
import UserService from '../services/UserService'
import { formatearGTQ, formatearFechaGT, formatearFechaCortaGT } from '../utils/formatters'

export function SalesPage() {
    const { usuario, agregarNotificacion, tienePermiso } = useApp()
    const [ventas, setVentas] = useState([])
    const [usuarios, setUsuarios] = useState([])
    const [filtros, setFiltros] = useState({
        usuarioId: '',
        estado: '',
        desde: '',
        hasta: '',
    })

    useEffect(() => {
        cargarDatos()
    }, [])

    const cargarDatos = () => {
        const resVentas = SalesService.obtenerVentas(filtros, usuario)
        const resUsuarios = UserService.obtenerUsuarios({ incluirEliminados: true })
        setVentas(resVentas.datos || [])
        setUsuarios(resUsuarios.datos || [])
    }

    useEffect(() => {
        cargarDatos()
    }, [JSON.stringify(filtros)])

    const aplicarFiltros = (campo, valor) => {
        setFiltros(prev => ({ ...prev, [campo]: valor }))
    }

    const limpiarFiltros = () => {
        setFiltros({ usuarioId: '', estado: '', desde: '', hasta: '' })
    }

    const resumen = useMemo(() => {
        const base = ventas.filter(venta => venta.estado !== ESTADOS_VENTA.ANULADA)
        return base.reduce((acc, venta) => ({
            cantidad: acc.cantidad + 1,
            total: acc.total + venta.total,
            pagadas: acc.pagadas + (venta.estado === ESTADOS_VENTA.PAGADA ? 1 : 0),
            credito: acc.credito + (venta.estado === ESTADOS_VENTA.SALDO_PENDIENTE ? venta.saldoPendiente : 0),
        }), { cantidad: 0, total: 0, pagadas: 0, credito: 0 })
    }, [ventas])

    const puedeVerTodo = tienePermiso('REPORTE_VER')

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Ventas</h1>
                    <p className="text-gray-600">
                        {puedeVerTodo ? 'Vista administrativa con filtros completos' : 'Tus ventas registradas'}
                    </p>
                </div>
                <button
                    onClick={cargarDatos}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
                >
                    <RefreshCcw size={18} />
                    Actualizar
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
                    <p className="text-sm text-gray-600">Transacciones</p>
                    <p className="text-2xl font-bold">{resumen.cantidad}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
                    <p className="text-sm text-gray-600">Total vendido</p>
                    <p className="text-2xl font-bold">{formatearGTQ(resumen.total)}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
                    <p className="text-sm text-gray-600">Pagadas</p>
                    <p className="text-2xl font-bold">{resumen.pagadas}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
                    <p className="text-sm text-gray-600">Saldo pendiente</p>
                    <p className="text-2xl font-bold">{formatearGTQ(resumen.credito)}</p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center gap-2 mb-4 text-gray-900 font-semibold">
                    <Filter size={18} />
                    Filtros
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    {puedeVerTodo && (
                        <select
                            value={filtros.usuarioId}
                            onChange={(e) => aplicarFiltros('usuarioId', e.target.value)}
                            className="px-3 py-2 border rounded-lg"
                        >
                            <option value="">Todos los usuarios</option>
                            {usuarios.map(item => (
                                <option key={item.id} value={item.id}>{item.nombre}</option>
                            ))}
                        </select>
                    )}
                    <select
                        value={filtros.estado}
                        onChange={(e) => aplicarFiltros('estado', e.target.value)}
                        className="px-3 py-2 border rounded-lg"
                    >
                        <option value="">Todos los estados</option>
                        {Object.values(ESTADOS_VENTA).map(estado => (
                            <option key={estado} value={estado}>{estado}</option>
                        ))}
                    </select>
                    <input
                        type="date"
                        value={filtros.desde}
                        onChange={(e) => aplicarFiltros('desde', e.target.value)}
                        className="px-3 py-2 border rounded-lg"
                    />
                    <input
                        type="date"
                        value={filtros.hasta}
                        onChange={(e) => aplicarFiltros('hasta', e.target.value)}
                        className="px-3 py-2 border rounded-lg"
                    />
                </div>
                <div className="mt-4 flex gap-2">
                    <button onClick={limpiarFiltros} className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200">Limpiar</button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Fecha</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Número</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Usuario</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Cliente</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Total</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Estado</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Detalle</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {ventas.map(venta => (
                            <tr key={venta.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm">{formatearFechaCortaGT(venta.fecha)}</td>
                                <td className="px-4 py-3 text-sm font-medium">{venta.numero}</td>
                                <td className="px-4 py-3 text-sm">{venta.usuarioNombre || venta.usuarioId || '-'}</td>
                                <td className="px-4 py-3 text-sm">{venta.clienteNombre || 'Consumidor final'}</td>
                                <td className="px-4 py-3 text-sm font-semibold">{formatearGTQ(venta.total)}</td>
                                <td className="px-4 py-3 text-sm">{venta.estado}</td>
                                <td className="px-4 py-3 text-sm">
                                    <details>
                                        <summary className="cursor-pointer text-primary">Ver</summary>
                                        <div className="mt-2 space-y-1 text-xs text-gray-700">
                                            <div>Subtotal: {formatearGTQ(venta.subtotal)}</div>
                                            <div>IVA 12%: {formatearGTQ(venta.impuesto)}</div>
                                            <div>Efectivo recibido: {formatearGTQ(venta.montoRecibido)}</div>
                                            <div>Cambio: {formatearGTQ(venta.cambio)}</div>
                                            <div>Registro: {formatearFechaGT(venta.fecha)}</div>
                                            <div>
                                                Líneas:
                                                <ul className="list-disc ml-5">
                                                    {venta.detalles.map((detalle, idx) => (
                                                        <li key={idx}>{detalle.cantidad} x {detalle.nombre} ({detalle.tipo})</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </details>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
