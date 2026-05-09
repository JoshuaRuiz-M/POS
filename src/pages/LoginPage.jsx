/**
 * [DOM-AUTH] Página de Login
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { LogIn } from 'lucide-react'

export function LoginPage() {
    const navigate = useNavigate()
    const { login } = useApp()

    const [email, setEmail] = useState('admin@punto.com')
    const [password, setPassword] = useState('admin123')
    const [cargando, setCargando] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setCargando(true)

        const resultado = login(email, password)

        setTimeout(() => {
            setCargando(false)
            if (resultado.estado === 'exito') {
                navigate('/')
            }
        }, 500)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center bg-primary rounded-lg mb-4">
                        <img src="/logo.png" alt="Logo" className="w-20 h-15" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">PUNTO COM</h1>
                    <p className="text-gray-600">Sistema de Punto de Venta</p>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="correo@empresa.com"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                        />
                    </div>

                    {/* Contraseña */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Contraseña
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                        />
                    </div>

                    {/* Botón Login */}
                    <button
                        type="submit"
                        disabled={cargando}
                        className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-medium py-2 rounded-lg transition-colors"
                    >
                        {cargando ? 'Ingresando...' : 'Ingresar'}
                    </button>
                </form>

                {/* Info */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-gray-600">
                        <strong>Demostración:</strong> admin@punto.com / admin123 o vendedor@punto.com / vendedor123
                    </p>
                </div>
            </div>
        </div>
    )
}
