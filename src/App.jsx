/**
 * [DOM-CORE] Aplicación Principal
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'
import { NotificationSystem } from './components/NotificationSystem'
import { Sidebar } from './components/Sidebar'
import AuthService from './services/AuthService'

// Páginas
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { POSPage } from './pages/POSPage'
import { InventoryPage } from './pages/InventoryPage'
import { ClientsPage } from './pages/ClientsPage'
import { ReportsPage } from './pages/ReportsPage'
import { SalesPage } from './pages/SalesPage'
import { UsersPage } from './pages/UsersPage'

// Componente de ruta protegida
function ProtectedRoute({ children }) {
    const { usuario, cargando } = useApp()

    if (cargando) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin inline-flex items-center justify-center w-12 h-12 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
                    <p className="text-gray-600">Cargando...</p>
                </div>
            </div>
        )
    }

    return usuario ? children : <Navigate to="/login" replace />
}

function AdminRoute({ children }) {
    const { usuario } = useApp()

    if (!usuario) {
        return <Navigate to="/login" replace />
    }

    return AuthService.esAdmin(usuario) ? children : <Navigate to="/" replace />
}

// Layout principal
function MainLayout({ children }) {
    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar />
            <div className="flex-1 overflow-auto">
                <main className="p-6">
                    {children}
                </main>
            </div>
            <NotificationSystem />
        </div>
    )
}

function AppRoutes() {
    return (
        <Routes>
            {/* Login */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protegidas */}
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <MainLayout>
                            <DashboardPage />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/pos"
                element={
                    <ProtectedRoute>
                        <MainLayout>
                            <POSPage />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/inventario"
                element={
                    <ProtectedRoute>
                        <MainLayout>
                            <InventoryPage />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/clientes"
                element={
                    <ProtectedRoute>
                        <MainLayout>
                            <ClientsPage />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/reportes"
                element={
                    <ProtectedRoute>
                        <MainLayout>
                            <ReportsPage />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/ventas"
                element={
                    <ProtectedRoute>
                        <MainLayout>
                            <SalesPage />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/usuarios"
                element={
                    <AdminRoute>
                        <MainLayout>
                            <UsersPage />
                        </MainLayout>
                    </AdminRoute>
                }
            />

            {/* Redireccionar al login si no existe la ruta */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
}

export default function App() {
    return (
        <Router>
            <AppProvider>
                <AppRoutes />
            </AppProvider>
        </Router>
    )
}
