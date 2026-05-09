/**
 * [DOM-LAYOUT] [DOM-BI] Dashboard Operativo
 */

import { useEffect, useState } from 'react'
import { DollarSign, ShoppingCart, AlertTriangle, TrendingUp } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { PERMISOS } from '../data/usuarios'
import BIService from '../services/BIService'
import InventoryService from '../services/InventoryService'
import { SkeletonDashboard } from '../components/SkeletonScreens'
import { formatearGTQ } from '../utils/formatters'

export function DashboardPage() {
    const { usuario, tienePermiso, agregarNotificacion } = useApp()
    const [cargando, setCargando] = useState(true)
    const [dashboard, setDashboard] = useState(null)
    const [alertas, setAlertas] = useState([])
    const [ventasDia, setVentasDia] = useState(null)

    useEffect(() => {
        cargarDatos()
    }, [])

    const cargarDatos = () => {
        setCargando(true)

        // Simular carga con skeleton
        setTimeout(() => {
            const dashboardData = BIService.obtenerDashboardEjecutivo()
            const resAlertas = InventoryService.obtenerAlertasStock()
            const resVentas = BIService.obtenerVentasDiarias()

            if (tienePermiso(PERMISOS.REPORTE_VER)) {
                setDashboard(dashboardData.datos)
            }

            setAlertas(resAlertas.datos || [])
            setVentasDia(resVentas.datos)
            setCargando(false)
        }, 800)
    }

    if (cargando) {
        return <SkeletonDashboard />
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600">Bienvenido, {usuario?.nombre}</p>
            </div>

            {/* KPIs - Solo para ADMIN */}
            {tienePermiso(PERMISOS.REPORTE_VER) && dashboard && (
                <>
                    {/* Fila 1: KPIs principales */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Ingresos */}
                        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm">Ingresos Hoy</p>
                                    <p className="text-2xl font-bold text-gray-900">{formatearGTQ(dashboard.kpis.ingresos.ingresoTotal)}</p>
                                </div>
                                <DollarSign className="text-green-500" size={32} />
                            </div>
                        </div>

                        {/* Transacciones */}
                        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm">Transacciones</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {dashboard.kpis.transacciones.transaccionesTotal}
                                    </p>
                                </div>
                                <ShoppingCart className="text-blue-500" size={32} />
                            </div>
                        </div>

                        {/* Cuentas por Cobrar */}
                        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-warning">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm">Por Cobrar</p>
                                    <p className="text-2xl font-bold text-gray-900">{formatearGTQ(dashboard.kpis.cartera.totalCartera)}</p>
                                </div>
                                <TrendingUp className="text-warning" size={32} />
                            </div>
                        </div>

                        {/* Disponibilidad Inventario */}
                        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm">Disponibilidad</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {dashboard.kpis.inventario.porcentajeDisponibilidad}%
                                    </p>
                                </div>
                                <div className="text-purple-500 text-2xl font-bold">✓</div>
                            </div>
                        </div>
                    </div>

                    {/* Fila 2: Ventas por semana */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ventas Última Semana</h3>
                        <div className="space-y-2">
                            {dashboard.ventasSemana?.map((dia, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                    <span className="text-sm text-gray-600">{dia.fecha}</span>
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm font-medium">{dia.cantidadVentas} ventas</span>
                                        <span className="font-semibold text-gray-900">
                                            {formatearGTQ(dia.total)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* Alertas de Inventario */}
            {alertas.length > 0 && (
                <div className="bg-red-50 rounded-lg shadow p-6 border border-red-200">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="text-red-500" size={24} />
                        <h3 className="text-lg font-semibold text-red-900">Alertas de Inventario</h3>
                    </div>
                    <div className="space-y-2">
                        {alertas.slice(0, 5).map(alerta => (
                            <div key={alerta.id} className="flex items-center justify-between p-3 bg-white rounded border border-red-200">
                                <div>
                                    <p className="font-medium text-gray-900">{alerta.nombre}</p>
                                    <p className={`text-sm ${alerta.tipo === 'AGOTADO' ? 'text-red-600' : 'text-warning'}`}>
                                        {alerta.tipo === 'AGOTADO' ? 'AGOTADO' : `Stock bajo: ${alerta.stock}`}
                                    </p>
                                </div>
                                <span className={`px-3 py-1 rounded text-sm font-medium ${alerta.tipo === 'AGOTADO'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {alerta.stock} unidades
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Acciones Rápidas */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <a href="/pos" className="p-4 text-center bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                        <ShoppingCart className="mx-auto mb-2 text-blue-600" size={28} />
                        <p className="font-medium text-gray-900">Nueva Venta</p>
                    </a>
                    {tienePermiso(PERMISOS.INV_GESTION) && (
                        <a href="/inventario" className="p-4 text-center bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                            <div className="mx-auto mb-2 text-green-600 text-2xl">📦</div>
                            <p className="font-medium text-gray-900">Inventario</p>
                        </a>
                    )}
                    <a href="/clientes" className="p-4 text-center bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                        <div className="mx-auto mb-2 text-purple-600 text-2xl">👥</div>
                        <p className="font-medium text-gray-900">Clientes</p>
                    </a>
                    {tienePermiso(PERMISOS.REPORTE_VER) && (
                        <a href="/reportes" className="p-4 text-center bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
                            <TrendingUp className="mx-auto mb-2 text-orange-600" size={28} />
                            <p className="font-medium text-gray-900">Reportes</p>
                        </a>
                    )}
                </div>
            </div>
        </div>
    )
}
