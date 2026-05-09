/**
 * [DOM-BI] Centro de reportes con exportación PDF y Excel
 */

import { useEffect, useMemo, useState } from 'react'
import { FileDown, FileSpreadsheet, RefreshCcw } from 'lucide-react'
import jsPDF from 'jspdf'
import * as XLSX from 'xlsx'
import { useApp } from '../context/AppContext'
import AuthService from '../services/AuthService'
import SalesService, { ESTADOS_VENTA } from '../services/SalesService'
import UserService from '../services/UserService'
import BIService from '../services/BIService'
import { formatearGTQ, formatearFechaCortaGT } from '../utils/formatters'

export function ReportsPage() {
    const { usuario } = useApp()
    const esAdmin = AuthService.esAdmin(usuario)
    const [ventas, setVentas] = useState([])
    const [usuarios, setUsuarios] = useState([])
    const [filtros, setFiltros] = useState({ usuarioId: '', estado: '', desde: '', hasta: '' })

    useEffect(() => {
        cargarDatos()
    }, [JSON.stringify(filtros)])

    const cargarDatos = () => {
        const resVentas = SalesService.obtenerVentas(filtros, usuario)
        const resUsuarios = UserService.obtenerUsuarios({ incluirEliminados: true })
        setVentas(resVentas.datos || [])
        setUsuarios(resUsuarios.datos || [])
    }

    const resumen = useMemo(() => {
        const activas = ventas.filter(venta => venta.estado !== ESTADOS_VENTA.ANULADA)
        return activas.reduce((acc, venta) => ({
            cantidad: acc.cantidad + 1,
            total: acc.total + venta.total,
            credito: acc.credito + (venta.estado === ESTADOS_VENTA.SALDO_PENDIENTE ? venta.saldoPendiente : 0),
            efectivo: acc.efectivo + (venta.estado === ESTADOS_VENTA.PAGADA ? venta.montoRecibido : 0),
        }), { cantidad: 0, total: 0, credito: 0, efectivo: 0 })
    }, [ventas])

    const aplicarFiltro = (campo, valor) => setFiltros(prev => ({ ...prev, [campo]: valor }))
    const limpiarFiltros = () => setFiltros({ usuarioId: '', estado: '', desde: '', hasta: '' })

    const exportarExcel = () => {
        const datos = ventas.map(venta => ({
            Fecha: formatearFechaCortaGT(venta.fecha),
            Número: venta.numero,
            Usuario: venta.usuarioNombre || venta.usuarioId || '-',
            Cliente: venta.clienteNombre || 'Consumidor final',
            Subtotal: venta.subtotal,
            IVA: venta.impuesto,
            Total: venta.total,
            Estado: venta.estado,
        }))
        const hoja = XLSX.utils.json_to_sheet(datos)
        const libro = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(libro, hoja, 'Ventas')
        XLSX.writeFile(libro, `reporte_ventas_${new Date().toISOString().slice(0, 10)}.xlsx`)
    }

    const exportarPDF = () => {
        const pdf = new jsPDF()
        pdf.setFontSize(16)
        pdf.text('PUNTO COM - Reporte de Ventas', 14, 16)
        pdf.setFontSize(10)
        pdf.text(`Generado: ${new Date().toLocaleString('es-GT')}`, 14, 24)
        pdf.text(`Total ventas: ${resumen.cantidad}`, 14, 32)
        pdf.text(`Total vendido: ${formatearGTQ(resumen.total)}`, 14, 38)
        pdf.text(`Efectivo: ${formatearGTQ(resumen.efectivo)}`, 14, 44)
        pdf.text(`Crédito: ${formatearGTQ(resumen.credito)}`, 14, 50)

        let y = 62
        ventas.slice(0, 20).forEach(venta => {
            pdf.text(`${venta.numero} | ${formatearFechaCortaGT(venta.fecha)} | ${formatearGTQ(venta.total)} | ${venta.estado}`, 14, y)
            y += 6
            if (y > 275) {
                pdf.addPage()
                y = 16
            }
        })

        pdf.save(`reporte_ventas_${new Date().toISOString().slice(0, 10)}.pdf`)
    }

    const kpi = BIService.obtenerKPIInventario().datos

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Reportes</h1>
                    <p className="text-gray-600">Ventas, BI y exportación PDF/Excel en quetzales</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <button onClick={cargarDatos} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200">
                        <RefreshCcw size={18} /> Actualizar
                    </button>
                    <button onClick={exportarExcel} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">
                        <FileSpreadsheet size={18} /> Excel
                    </button>
                    <button onClick={exportarPDF} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">
                        <FileDown size={18} /> PDF
                    </button>
                </div>
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
                    <p className="text-sm text-gray-600">Crédito</p>
                    <p className="text-2xl font-bold">{formatearGTQ(resumen.credito)}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
                    <p className="text-sm text-gray-600">Inventario disponible</p>
                    <p className="text-2xl font-bold">{kpi?.porcentajeDisponibilidad || 0}%</p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    {esAdmin && (
                        <select value={filtros.usuarioId} onChange={(e) => aplicarFiltro('usuarioId', e.target.value)} className="px-3 py-2 border rounded-lg">
                            <option value="">Todos los usuarios</option>
                            {usuarios.map(item => <option key={item.id} value={item.id}>{item.nombre}</option>)}
                        </select>
                    )}
                    <select value={filtros.estado} onChange={(e) => aplicarFiltro('estado', e.target.value)} className="px-3 py-2 border rounded-lg">
                        <option value="">Todos los estados</option>
                        {Object.values(ESTADOS_VENTA).map(estado => <option key={estado} value={estado}>{estado}</option>)}
                    </select>
                    <input type="date" value={filtros.desde} onChange={(e) => aplicarFiltro('desde', e.target.value)} className="px-3 py-2 border rounded-lg" />
                    <input type="date" value={filtros.hasta} onChange={(e) => aplicarFiltro('hasta', e.target.value)} className="px-3 py-2 border rounded-lg" />
                </div>
                <div className="mt-3">
                    <button onClick={limpiarFiltros} className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200">Limpiar filtros</button>
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
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
