/**
 * [DOM-BI] Servicio de Inteligencia de Negocio
 * Análisis, métricas y datasets para dashboards
 */

import LocalStorageEngine from './LocalStorageEngine'
import SalesService from './SalesService'

class BIService {
    /**
     * DS_VENTAS_DIARIAS: Datos de ventas del día
     */
    static obtenerVentasDiarias(fecha = new Date().toISOString().slice(0, 10)) {
        return SalesService.obtenerVentasDiarias(fecha)
    }

    /**
     * Obtiene ventas de la última semana
     */
    static obtenerVentasSemana() {
        const ventas = LocalStorageEngine.get('ventas') || []
        const hoy = new Date()
        const hace7Dias = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000)

        const ventasSemanales = ventas.filter(
            v => new Date(v.fecha) >= hace7Dias && v.estado !== 'ANULADA'
        )

        const por_dia = {}
        ventasSemanales.forEach(v => {
            const dia = v.fecha.slice(0, 10)
            if (!por_dia[dia]) {
                por_dia[dia] = {
                    fecha: dia,
                    cantidadVentas: 0,
                    total: 0,
                }
            }
            por_dia[dia].cantidadVentas++
            por_dia[dia].total += v.total
        })

        const datos = Object.values(por_dia).sort((a, b) => new Date(a.fecha) - new Date(b.fecha))

        return {
            estado: 'exito',
            datos,
            mensaje: 'Ventas de la semana calculadas',
        }
    }

    /**
     * DS_RANKING_PRODUCTOS: Productos más vendidos
     */
    static obtenerRankingProductos(limite = 5) {
        const ventas = LocalStorageEngine.get('ventas') || []
        const productos = LocalStorageEngine.get('productos') || []

        const ranking = {}

        ventas.forEach(venta => {
            if (venta.estado !== 'ANULADA') {
                venta.detalles.forEach(detalle => {
                    if (!ranking[detalle.productoId]) {
                        ranking[detalle.productoId] = {
                            id: detalle.productoId,
                            nombre: detalle.productoNombre,
                            cantidadVendida: 0,
                            totalVentas: 0,
                        }
                    }
                    ranking[detalle.productoId].cantidadVendida += detalle.cantidad
                    ranking[detalle.productoId].totalVentas += detalle.subtotal
                })
            }
        })

        const datos = Object.values(ranking)
            .sort((a, b) => b.cantidadVendida - a.cantidadVendida)
            .slice(0, limite)

        return {
            estado: 'exito',
            datos,
            mensaje: 'Ranking de productos calculado',
        }
    }

    /**
     * DS_CARTERA_CLIENTES: Morosidad y cuentas por cobrar
     */
    static obtenerCarteraClientes() {
        return SalesService.obtenerCarteraClientes()
    }

    /**
     * Obtiene total de cartera
     */
    static obtenerTotalCartera() {
        const res = this.obtenerCarteraClientes()
        const totalCartera = res.datos.reduce((sum, c) => sum + c.saldoPendiente, 0)

        return {
            estado: 'exito',
            datos: {
                totalCartera,
                clientesMorosos: res.datos.length,
                promedioDeuda: res.datos.length > 0 ? totalCartera / res.datos.length : 0,
            },
            mensaje: 'Total de cartera calculado',
        }
    }

    /**
     * Obtiene KPI: Número de transacciones
     */
    static obtenerKPITransacciones() {
        const ventas = LocalStorageEngine.get('ventas') || []
        const transaccionesActivas = ventas.filter(v => v.estado !== 'ANULADA')

        return {
            estado: 'exito',
            datos: {
                transaccionesTotal: transaccionesActivas.length,
                transaccionesPagadas: transaccionesActivas.filter(v => v.estado === 'PAGADA').length,
                transaccionesCrédito: transaccionesActivas.filter(v => v.estado === 'SALDO_PENDIENTE').length,
                transaccionesAnuladas: ventas.filter(v => v.estado === 'ANULADA').length,
            },
            mensaje: 'KPI de transacciones calculado',
        }
    }

    /**
     * Obtiene KPI: Ingresos
     */
    static obtenerKPIIngresos() {
        const ventas = LocalStorageEngine.get('ventas') || []
        const ventasActivas = ventas.filter(v => v.estado !== 'ANULADA')

        const ingresoTotal = ventasActivas.reduce((sum, v) => sum + v.total, 0)
        const efectivoRecibido = ventasActivas.reduce((sum, v) => {
            return sum + (v.estado === 'PAGADA' ? v.montoRecibido : 0)
        }, 0)

        return {
            estado: 'exito',
            datos: {
                ingresoTotal,
                efectivoRecibido,
                cuentasPorCobrar: ingresoTotal - efectivoRecibido,
                margenPromedio: ventasActivas.length > 0 ? ingresoTotal / ventasActivas.length : 0,
            },
            mensaje: 'KPI de ingresos calculado',
        }
    }

    /**
     * Obtiene KPI: Inventario
     */
    static obtenerKPIInventario() {
        const productos = LocalStorageEngine.get('productos') || []

        const totalItems = productos.reduce((sum, p) => sum + p.stock, 0)
        const productosAgotados = productos.filter(p => p.stock === 0).length
        const productosBajos = productos.filter(p => p.stock <= p.stockMinimo).length

        return {
            estado: 'exito',
            datos: {
                totalProductos: productos.length,
                totalItems,
                productosAgotados,
                productosBajos,
                porcentajeDisponibilidad: productos.length > 0
                    ? ((productos.length - productosAgotados) / productos.length * 100).toFixed(2)
                    : 0,
            },
            mensaje: 'KPI de inventario calculado',
        }
    }

    /**
     * Obtiene dashboard ejecutivo (resumen general)
     */
    static obtenerDashboardEjecutivo() {
        const ventasDia = this.obtenerVentasDiarias()
        const ventasSemana = this.obtenerVentasSemana()
        const kpiTransacciones = this.obtenerKPITransacciones()
        const kpiIngresos = this.obtenerKPIIngresos()
        const kpiInventario = this.obtenerKPIInventario()
        const cartera = this.obtenerTotalCartera()

        return {
            estado: 'exito',
            datos: {
                fecha: new Date().toISOString(),
                ventasDia: ventasDia.datos,
                ventasSemana: ventasSemana.datos,
                kpis: {
                    transacciones: kpiTransacciones.datos,
                    ingresos: kpiIngresos.datos,
                    inventario: kpiInventario.datos,
                    cartera: cartera.datos,
                },
            },
            mensaje: 'Dashboard ejecutivo cargado',
        }
    }

    /**
     * Obtiene reporte general (para auditoría)
     */
    static obtenerReporteGeneral() {
        const dashboard = this.obtenerDashboardEjecutivo()
        const ranking = this.obtenerRankingProductos(10)
        const cartera = this.obtenerCarteraClientes()

        return {
            estado: 'exito',
            datos: {
                generadoEn: new Date().toISOString(),
                dashboard: dashboard.datos,
                rankingProductos: ranking.datos,
                carteraClientes: cartera.datos,
            },
            mensaje: 'Reporte general generado',
        }
    }
}

export default BIService
