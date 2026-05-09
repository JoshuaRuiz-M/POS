/**
 * [DOM-CORE] LocalStorage Persistence Engine
 * Centralizado motor de persistencia de datos
 */

const STORAGE_KEY = 'PUNTO_COM_DATA'
const STORAGE_VERSION = '1.0.0'

const DEFAULT_STATE = {
    usuarios: [],
    productos: [],
    servicios: [],
    ventas: [],
    clientes: [],
    cartera: [],
    auditorias: [],
    configuracion: {},
}

class LocalStorageEngine {
    /**
     * Inicializa el motor de persistencia
     */
    static init() {
        if (!this.getAll()) {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({
                    version: STORAGE_VERSION,
                    timestamp: new Date().toISOString(),
                    data: DEFAULT_STATE,
                })
            )
        }
    }

    /**
     * Obtiene todos los datos del storage
     */
    static getAll() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY)
            return stored ? JSON.parse(stored) : null
        } catch (error) {
            console.error('❌ Error al leer LocalStorage:', error)
            return null
        }
    }

    /**
     * Obtiene un dominio específico
     */
    static get(domain) {
        const all = this.getAll()
        return all?.data?.[domain] || null
    }

    /**
     * Persiste datos en un dominio
     */
    static set(domain, data) {
        try {
            const all = this.getAll()
            if (!all) throw new Error('Storage no inicializado')

            all.data[domain] = data
            all.timestamp = new Date().toISOString()

            localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
            return { estado: 'exito', datos: data, mensaje: 'Datos persistidos exitosamente' }
        } catch (error) {
            console.error(`❌ Error al guardar en dominio ${domain}:`, error)
            return { estado: 'error', datos: null, mensaje: error.message }
        }
    }

    /**
     * Validación de integridad de datos
     */
    static syncCheck() {
        const all = this.getAll()
        if (!all) return { estado: 'error', mensaje: 'Storage corrupto' }

        const checks = {
            version: all.version === STORAGE_VERSION,
            estructura: Boolean(all.data),
            dominios: {
                usuarios: Array.isArray(all.data.usuarios),
                productos: Array.isArray(all.data.productos),
                servicios: Array.isArray(all.data.servicios),
                ventas: Array.isArray(all.data.ventas),
                clientes: Array.isArray(all.data.clientes),
                cartera: Array.isArray(all.data.cartera),
                auditorias: Array.isArray(all.data.auditorias),
            },
        }

        const isValid = checks.version && checks.estructura && Object.values(checks.dominios).every(v => v)

        return {
            estado: isValid ? 'exito' : 'error',
            datos: checks,
            mensaje: isValid ? 'Storage íntegro' : 'Storage con inconsistencias',
        }
    }

    /**
     * Limpia todos los datos
     */
    static clear() {
        localStorage.removeItem(STORAGE_KEY)
        this.init()
        return { estado: 'exito', mensaje: 'Storage limpiado' }
    }

    /**
     * Exporta datos para auditoría
     */
    static export() {
        return this.getAll()
    }

    /**
     * Importa datos (restauración)
     */
    static import(backup) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(backup))
            return { estado: 'exito', mensaje: 'Datos importados exitosamente' }
        } catch (error) {
            return { estado: 'error', mensaje: error.message }
        }
    }
}

export default LocalStorageEngine
