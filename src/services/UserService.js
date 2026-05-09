/**
 * [DOM-AUTH] Administración de usuarios
 */

import LocalStorageEngine from './LocalStorageEngine'
import { obtenerDatosUsuarios, PERMISOS, ROLES } from '../data/usuarios'

const DEFAULT_USERS = obtenerDatosUsuarios()

class UserService {
    static seedDemoUsers() {
        const usuarios = LocalStorageEngine.get('usuarios') || []
        if (usuarios.length > 0) return { estado: 'exito', datos: usuarios, mensaje: 'Usuarios ya inicializados' }
        LocalStorageEngine.set('usuarios', DEFAULT_USERS)
        return { estado: 'exito', datos: DEFAULT_USERS, mensaje: 'Usuarios demo inicializados' }
    }

    static obtenerUsuarios({ incluirEliminados = false } = {}) {
        const usuarios = (LocalStorageEngine.get('usuarios') || []).filter(usuario => incluirEliminados ? true : usuario.eliminado !== true)
        return { estado: 'exito', datos: usuarios, mensaje: 'Usuarios cargados' }
    }

    static obtenerUsuario(id) {
        const usuarios = LocalStorageEngine.get('usuarios') || []
        const usuario = usuarios.find(item => item.id === id)
        if (!usuario) return { estado: 'error', datos: null, mensaje: 'Usuario no encontrado' }
        return { estado: 'exito', datos: usuario, mensaje: 'Usuario encontrado' }
    }

    static crearUsuario(datos) {
        const usuarios = LocalStorageEngine.get('usuarios') || []
        if (usuarios.some(item => item.email === datos.email)) {
            return { estado: 'error', datos: null, mensaje: 'El correo ya está registrado' }
        }

        const nuevo = {
            id: `USR_${Date.now()}`,
            nombre: datos.nombre,
            email: datos.email,
            password: datos.password,
            rol: datos.rol || ROLES.VENDEDOR,
            activo: true,
            eliminado: false,
            permisos: datos.rol === ROLES.ADMIN ? Object.values(PERMISOS) : [PERMISOS.VENTA_CREAR],
            creadoEn: new Date().toISOString(),
        }
        usuarios.push(nuevo)
        LocalStorageEngine.set('usuarios', usuarios)
        return { estado: 'exito', datos: nuevo, mensaje: 'Usuario creado exitosamente' }
    }

    static actualizarUsuario(id, datos) {
        const usuarios = LocalStorageEngine.get('usuarios') || []
        const usuario = usuarios.find(item => item.id === id)
        if (!usuario) return { estado: 'error', datos: null, mensaje: 'Usuario no encontrado' }
        if (datos.email && usuarios.some(item => item.email === datos.email && item.id !== id)) {
            return { estado: 'error', datos: null, mensaje: 'El correo ya está registrado' }
        }
        Object.assign(usuario, {
            ...datos,
            permisos: datos.rol === ROLES.ADMIN ? Object.values(PERMISOS) : [PERMISOS.VENTA_CREAR],
        })
        LocalStorageEngine.set('usuarios', usuarios)
        return { estado: 'exito', datos: usuario, mensaje: 'Usuario actualizado exitosamente' }
    }

    static eliminarUsuario(id) {
        const usuarios = LocalStorageEngine.get('usuarios') || []
        const usuario = usuarios.find(item => item.id === id)
        if (!usuario) return { estado: 'error', datos: null, mensaje: 'Usuario no encontrado' }
        usuario.eliminado = true
        usuario.activo = false
        usuario.eliminadoEn = new Date().toISOString()
        LocalStorageEngine.set('usuarios', usuarios)
        return { estado: 'exito', datos: usuario, mensaje: 'Usuario desactivado' }
    }

    static restaurarUsuario(id) {
        const usuarios = LocalStorageEngine.get('usuarios') || []
        const usuario = usuarios.find(item => item.id === id)
        if (!usuario) return { estado: 'error', datos: null, mensaje: 'Usuario no encontrado' }
        usuario.eliminado = false
        usuario.activo = true
        usuario.restauradoEn = new Date().toISOString()
        LocalStorageEngine.set('usuarios', usuarios)
        return { estado: 'exito', datos: usuario, mensaje: 'Usuario restaurado' }
    }
}

export default UserService