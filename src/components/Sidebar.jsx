/**
 * [DOM-LAYOUT] Sidebar/Menú Principal
 */

import { Link } from 'react-router-dom'
import { Home, ShoppingCart, Package, Users, BarChart3, LogOut, Menu, X, ListOrdered, UserCog } from 'lucide-react'
import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { PERMISOS } from '../data/usuarios'

export function Sidebar() {
    const { usuario, logout, tienePermiso } = useApp()
    const [abierto, setAbierto] = useState(true)

    const menuItems = [
        {
            titulo: 'Inicio',
            icono: Home,
            ruta: '/',
            requierePermiso: null,
        },
        {
            titulo: 'Punto de Venta',
            icono: ShoppingCart,
            ruta: '/pos',
            requierePermiso: PERMISOS.VENTA_CREAR,
        },
        {
            titulo: 'Ventas',
            icono: ListOrdered,
            ruta: '/ventas',
            requierePermiso: PERMISOS.VENTA_CREAR,
        },
        {
            titulo: 'Inventario',
            icono: Package,
            ruta: '/inventario',
            requierePermiso: PERMISOS.INV_GESTION,
        },
        {
            titulo: 'Clientes',
            icono: Users,
            ruta: '/clientes',
            requierePermiso: null,
        },
        {
            titulo: 'Reportes',
            icono: BarChart3,
            ruta: '/reportes',
            requierePermiso: PERMISOS.REPORTE_VER,
        },
        {
            titulo: 'Usuarios',
            icono: UserCog,
            ruta: '/usuarios',
            requierePermiso: PERMISOS.USER_EDIT,
        },
    ]

    const itemsVisibles = menuItems.filter(
        item => !item.requierePermiso || tienePermiso(item.requierePermiso)
    )

    return (
        <div className="flex h-full">
            {/* Sidebar */}
            <div className={`bg-secondary text-white transition-all duration-300 ${abierto ? 'w-64' : 'w-20'} border-r border-blue-900`}>
                {/* Header */}
                <div className="p-4 border-b border-blue-900">
                    <div className="flex items-center justify-between">
                        {abierto && <h1 className="font-bold text-lg">PUNTO COM</h1>}
                        <button
                            onClick={() => setAbierto(!abierto)}
                            className="p-1 hover:bg-blue-700 rounded transition-colors"
                        >
                            {abierto ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>

                {/* Usuario Info */}
                {abierto && usuario && (
                    <div className="p-4 bg-blue-700 border-b border-blue-900">
                        <p className="text-sm font-semibold truncate">{usuario.nombre}</p>
                        <p className="text-xs text-blue-200">{usuario.rol}</p>
                    </div>
                )}

                {/* Menú Items */}
                <nav className="p-4 space-y-2">
                    {itemsVisibles.map((item) => {
                        const Icon = item.icono
                        return (
                            <Link
                                key={item.ruta}
                                to={item.ruta}
                                className="flex items-center gap-3 px-4 py-3 rounded hover:bg-blue-700 transition-colors"
                                title={item.titulo}
                            >
                                <Icon size={20} />
                                {abierto && <span className="text-sm">{item.titulo}</span>}
                            </Link>
                        )
                    })}
                </nav>

                {/* Logout */}
                <div className=" bottom-4 left-4 right-4">
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded hover:bg-red-700 transition-colors"
                        title="Cerrar sesión"
                    >
                        <LogOut size={20} />
                        {abierto && <span className="text-sm">Cerrar Sesión</span>}
                    </button>
                </div>
            </div>
        </div>
    )
}
