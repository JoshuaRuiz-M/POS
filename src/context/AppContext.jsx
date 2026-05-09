/**
 * [DOM-CORE] Contexto global de la aplicación
 */

import { createContext, useContext, useState, useEffect } from 'react'
import AuthService from '../services/AuthService'
import LocalStorageEngine from '../services/LocalStorageEngine'
import InventoryService from '../services/InventoryService'
import ClientService from '../services/ClientService'
import ServiceCatalogService from '../services/ServiceCatalogService'
import UserService from '../services/UserService'

const AppContext = createContext()

export function useApp() {
    const context = useContext(AppContext)
    if (!context) {
        throw new Error('useApp debe usarse dentro de AppProvider')
    }
    return context
}

export function AppProvider({ children }) {
    const [usuario, setUsuario] = useState(null)
    const [cargando, setCargando] = useState(true)
    const [notificaciones, setNotificaciones] = useState([])

    // Inicializar aplicación
    useEffect(() => {
        LocalStorageEngine.init()
        AuthService.seedUsers()
        UserService.seedDemoUsers()
        InventoryService.initDemoData()
        ClientService.initDemoData()
        ServiceCatalogService.initDemoData()

        const usuarioGuardado = AuthService.getCurrentUser()
        if (usuarioGuardado) {
            setUsuario(usuarioGuardado)
        }

        setCargando(false)
    }, [])

    const login = (email, password) => {
        const resultado = AuthService.login(email, password)
        if (resultado.estado === 'exito') {
            setUsuario(resultado.datos)
            agregarNotificacion(`¡Bienvenido ${resultado.datos.nombre}!`, 'exito')
        } else {
            agregarNotificacion(resultado.mensaje, 'error')
        }
        return resultado
    }

    const logout = () => {
        AuthService.logout()
        setUsuario(null)
        agregarNotificacion('Sesión cerrada', 'info')
    }

    const tienePermiso = (permiso) => {
        return usuario && usuario.permisos.includes(permiso)
    }

    const agregarNotificacion = (mensaje, tipo = 'info') => {
        const id = Date.now()
        const notif = { id, mensaje, tipo }
        setNotificaciones(prev => [...prev, notif])

        // Auto-remover después de 4 segundos
        setTimeout(() => {
            removerNotificacion(id)
        }, 4000)
    }

    const removerNotificacion = (id) => {
        setNotificaciones(prev => prev.filter(n => n.id !== id))
    }

    const value = {
        usuario,
        cargando,
        notificaciones,
        login,
        logout,
        tienePermiso,
        agregarNotificacion,
        removerNotificacion,
    }

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}
