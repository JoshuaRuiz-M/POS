/**
 * [DOM-AUTH] Servicio de Autenticación y RBAC
 * Sistema de gestión de permisos y roles de usuario
 */

import { obtenerDatosUsuarios } from '../data/usuarios'
import LocalStorageEngine from './LocalStorageEngine'
import { PERMISOS_POR_ROL, ROLES } from '../data/usuarios'



const USUARIOS_DEMO = obtenerDatosUsuarios()

class AuthService {
    /**
     * Obtiene el usuario autenticado actualmente
     */
    static getCurrentUser() {
        const stored = localStorage.getItem('PUNTO_COM_AUTH')
        return stored ? JSON.parse(stored) : null
    }

    static seedUsers() {
        const usuarios = LocalStorageEngine.get('usuarios') || []
        if (usuarios.length === 0) {
            LocalStorageEngine.set('usuarios', USUARIOS_DEMO.map(usuario => ({
                ...usuario,
                eliminado: false,
                creadoEn: new Date().toISOString(),
            })))
        }
    }

    /**
     * Realiza login del usuario
     */
    static login(email, password) {
        if (!email || !password) {
            return {
                estado: 'error',
                datos: null,
                mensaje: 'Email y contraseña son requeridos'
            }
        }

        const usuarios = LocalStorageEngine.get('usuarios') || []
        const usuarioBase = usuarios.find(usuario => usuario.email === email && usuario.password === password && usuario.activo !== false && usuario.eliminado !== true)

        if (!usuarioBase) {
            return {
                estado: 'error',
                datos: null,
                mensaje: 'Credenciales inválidas'
            }
        }

        const usuario = {
            id: usuarioBase.id,
            email: usuarioBase.email,
            nombre: usuarioBase.nombre,
            rol: usuarioBase.rol,
            permisos: PERMISOS_POR_ROL[usuarioBase.rol] || [],
            loginTime: new Date().toISOString(),
            token: `TOKEN_${Date.now()}_${Math.random()}`,
        }

        localStorage.setItem('PUNTO_COM_AUTH', JSON.stringify(usuario))

        LocalStorageEngine.set('usuarios', usuarios.map(item => item.id === usuarioBase.id ? { ...item, ultimoAcceso: usuario.loginTime } : item))

        // Registrar en auditoría
        this.registrarAuditoria('LOGIN', usuario.email, 'exito')

        return {
            estado: 'exito',
            datos: usuario,
            mensaje: `Bienvenido ${usuario.nombre}`,
        }
    }

    /**
     * Realiza logout del usuario
     */
    static logout() {
        const usuario = this.getCurrentUser()
        if (usuario) {
            this.registrarAuditoria('LOGOUT', usuario.email, 'exito')
        }
        localStorage.removeItem('PUNTO_COM_AUTH')
        sessionStorage.clear() // Limpiar cualquier dato de sesión
        return {
            estado: 'exito',
            datos: null,
            mensaje: 'Sesión cerrada exitosamente',
        }
    }

    /**
     * Verifica si el usuario tiene un permiso específico
     */
    static tienePermiso(permiso) {
        const usuario = this.getCurrentUser()
        if (!usuario) return false
        return usuario.permisos.includes(permiso)
    }

    static esAdmin(usuario = this.getCurrentUser()) {
        return usuario?.rol === ROLES.ADMIN
    }

    /**
     * Verifica si el usuario está autenticado
     */
    static estáAutenticado() {
        return Boolean(this.getCurrentUser())
    }

    /**
     * Registra eventos de auditoría
     */
    static registrarAuditoria(evento, usuario, resultado) {
        const auditorias = LocalStorageEngine.get('auditorias') || []
        auditorias.push({
            id: `AUD_${Date.now()}`,
            evento,
            usuario,
            resultado,
            timestamp: new Date().toISOString(),
        })
        LocalStorageEngine.set('auditorias', auditorias)
    }
}

export default AuthService
