/**
 * [DOM-AUTH] Administración de usuarios
 */

import { useEffect, useState } from 'react'
import { UserCog, Plus, RotateCcw, Trash2 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import UserService from '../services/UserService'
import { ROLES } from '../data/usuarios'

export function UsersPage() {
    const { usuario, agregarNotificacion } = useApp()
    const [usuarios, setUsuarios] = useState([])
    const [mostrarEliminados, setMostrarEliminados] = useState(false)
    const [editando, setEditando] = useState(null)
    const [formulario, setFormulario] = useState({
        nombre: '',
        email: '',
        password: '',
        rol: ROLES.VENDEDOR,
    })

    useEffect(() => {
        cargarUsuarios()
    }, [mostrarEliminados])

    const cargarUsuarios = () => {
        const res = UserService.obtenerUsuarios({ incluirEliminados: mostrarEliminados })
        setUsuarios(res.datos || [])
    }

    const resetForm = () => {
        setFormulario({ nombre: '', email: '', password: '', rol: ROLES.VENDEDOR })
        setEditando(null)
    }

    const guardarUsuario = (e) => {
        e.preventDefault()
        const payload = { ...formulario }
        const res = editando
            ? UserService.actualizarUsuario(editando.id, payload)
            : UserService.crearUsuario(payload)

        if (res.estado === 'exito') {
            agregarNotificacion(res.mensaje, 'exito')
            cargarUsuarios()
            resetForm()
        } else {
            agregarNotificacion(res.mensaje, 'error')
        }
    }

    const editar = (item) => {
        setEditando(item)
        setFormulario({
            nombre: item.nombre,
            email: item.email,
            password: item.password,
            rol: item.rol,
        })
    }

    const alternarEstado = (item) => {
        const res = item.eliminado ? UserService.restaurarUsuario(item.id) : UserService.eliminarUsuario(item.id)
        agregarNotificacion(res.mensaje, res.estado)
        cargarUsuarios()
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Usuarios</h1>
                    <p className="text-gray-600">Administración de cuentas internas</p>
                </div>
                <button
                    onClick={() => setMostrarEliminados(prev => !prev)}
                    className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
                >
                    {mostrarEliminados ? 'Ocultar desactivados' : 'Ver desactivados'}
                </button>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-2 mb-4 font-semibold text-gray-900">
                    <UserCog size={18} />
                    {editando ? 'Editar usuario' : 'Crear usuario'}
                </div>
                <form onSubmit={guardarUsuario} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input value={formulario.nombre} onChange={(e) => setFormulario(prev => ({ ...prev, nombre: e.target.value }))} placeholder="Nombre" className="px-3 py-2 border rounded-lg" />
                    <input value={formulario.email} onChange={(e) => setFormulario(prev => ({ ...prev, email: e.target.value }))} placeholder="Correo" type="email" className="px-3 py-2 border rounded-lg" />
                    <input value={formulario.password} onChange={(e) => setFormulario(prev => ({ ...prev, password: e.target.value }))} placeholder="Contraseña" type="password" className="px-3 py-2 border rounded-lg" />
                    <select value={formulario.rol} onChange={(e) => setFormulario(prev => ({ ...prev, rol: e.target.value }))} className="px-3 py-2 border rounded-lg">
                        <option value={ROLES.VENDEDOR}>Vendedor</option>
                        <option value={ROLES.ADMIN}>Administrador</option>
                    </select>
                    <div className="md:col-span-2 flex gap-2">
                        <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90">{editando ? 'Actualizar' : 'Crear'}</button>
                        <button type="button" onClick={resetForm} className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200">Limpiar</button>
                    </div>
                </form>
            </div>

            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Nombre</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Correo</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Rol</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Estado</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {usuarios.map(item => (
                            <tr key={item.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm">{item.nombre}</td>
                                <td className="px-4 py-3 text-sm">{item.email}</td>
                                <td className="px-4 py-3 text-sm">{item.rol}</td>
                                <td className="px-4 py-3 text-sm">{item.eliminado ? 'Desactivado' : 'Activo'}</td>
                                <td className="px-4 py-3 text-sm">
                                    <div className="flex gap-2">
                                        <button onClick={() => editar(item)} className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200">Editar</button>
                                        <button onClick={() => alternarEstado(item)} className="px-3 py-1 rounded bg-red-50 text-red-700 hover:bg-red-100 flex items-center gap-1">
                                            {item.eliminado ? <RotateCcw size={14} /> : <Trash2 size={14} />}
                                            {item.eliminado ? 'Restaurar' : 'Desactivar'}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {usuario?.id && (
                <p className="text-xs text-gray-500">Sesión activa: {usuario.nombre} ({usuario.rol})</p>
            )}
        </div>
    )
}
