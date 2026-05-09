/**
 * [DOM-LAYOUT] Sistema de Notificaciones
 */

import { AlertCircle, CheckCircle, InfoIcon, X } from 'lucide-react'
import { useApp } from '../context/AppContext'

export function NotificationSystem() {
    const { notificaciones, removerNotificacion } = useApp()

    const iconos = {
        error: AlertCircle,
        exito: CheckCircle,
        info: InfoIcon,
    }

    const colores = {
        error: 'bg-red-50 border-red-200 text-red-800',
        exito: 'bg-green-50 border-green-200 text-green-800',
        info: 'bg-blue-50 border-blue-200 text-blue-800',
    }

    return (
        <div className="fixed bottom-4 right-4 space-y-2 z-50 max-w-md">
            {notificaciones.map(notif => {
                const Icon = iconos[notif.tipo] || InfoIcon
                const estilos = colores[notif.tipo]

                return (
                    <div
                        key={notif.id}
                        className={`flex items-start gap-3 p-4 rounded-lg border ${estilos} animate-in slide-in-from-right`}
                    >
                        <Icon size={20} className="flex-shrink-0 mt-0.5" />
                        <p className="flex-1 text-sm">{notif.mensaje}</p>
                        <button
                            onClick={() => removerNotificacion(notif.id)}
                            className="flex-shrink-0 hover:opacity-70 transition-opacity"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )
            })}
        </div>
    )
}
