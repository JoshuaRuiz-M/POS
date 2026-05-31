# PUNTO COM - Sistema de Punto de Venta (POS)

> **Estado:** 🚀 Prototipo de Alta Fidelidad  
> **Lenguaje:** Español (UI, Logs, Lógica de Negocio)  
> **Persistencia:** LocalStorage Engine  
> **Tecnología:** React 18+ | Vite | Tailwind CSS

---

## 📋 Resumen Ejecutivo

**PUNTO COM** es un prototipo de sistema de punto de venta empresarial con soporte para:

✅ **Gestión completa de ventas** (POS, pagos, créditos)  
✅ **Inventario inteligente** con alertas de stock  
✅ **RBAC completo** (Administrador, Vendedor)  
✅ **Dashboard BI** con KPIs y métricas  
✅ **Cartera de clientes** y morosidad  
✅ **Auditoría y trazabilidad** de operaciones

---

## 🏗️ Arquitectura

### [DOM-CORE] - Núcleo

```
src/
├── services/
│   ├── LocalStorageEngine.js      # Motor de persistencia
│   ├── AuthService.js             # Autenticación y RBAC
│   ├── InventoryService.js        # Gestión de inventario
│   ├── SalesService.js            # Transacciones POS/Pagos
│   ├── ClientService.js           # Gestión de clientes
│   └── BIService.js               # Inteligencia de negocio
├── context/
│   └── AppContext.jsx             # Estado global
├── components/
│   ├── Sidebar.jsx                # [DOM-LAYOUT] Navegación
│   ├── NotificationSystem.jsx     # [DOM-LAYOUT] Notificaciones
│   └── SkeletonScreens.jsx        # [DOM-BI] Skeleton loading
└── pages/
    ├── LoginPage.jsx              # [DOM-AUTH] Autenticación
    ├── DashboardPage.jsx          # [DOM-LAYOUT] Dashboard operativo
    ├── POSPage.jsx                # [DOM-POS] Punto de venta
    ├── InventoryPage.jsx          # [DOM-INV] Inventario
    ├── ClientsPage.jsx            # [DOM-PAGOS] Clientes y cartera
    └── ReportsPage.jsx            # [DOM-BI] Reportes y analytics
```

---

## 🔐 Seguridad y RBAC

### Roles Implementados

| Rol | Permisos |
| --- | --- |
| **ADMIN** | VENTA_CREAR, VENTA_ANULAR, INV_GESTION, REPORTE_VER, USER_EDIT |
| **VENDEDOR** | VENTA_CREAR |

### Acceso por Credenciales

```
Admin:
  Email: admin@punto.com
  Contraseña: admin123
  Rol: ADMIN

Vendedor:
  Email: vendedor@punto.com
  Contraseña: vendedor123
  Rol: VENDEDOR
```

---

## 📊 Módulos y Flujos

### [DOM-POS] Punto de Venta

1. **Búsqueda con Debounce** (300ms) o escaneo de código de barras
2. **Validación de Stock** mediante InventoryService
3. **Selección Opcional de Cliente** antes de finalizar
4. **Cálculo de Pagos** y cambio automático
5. **Persistencia** en LocalStorage

### [DOM-PAGOS] Gestión de Pagos y Créditos

```javascript
// Transición de estados
Si Monto_Recibido >= Total_Venta → PAGADA
Si Monto_Recibido < Total_Venta → SALDO_PENDIENTE
```

### [DOM-INV] Anulación (Rollback Atómico)

1. Identificar venta en historial
2. Reversión de stock (operación atómica)
3. Cambio de estado a `ANULADA`
4. Commit en LocalStorage solo si finaliza exitosamente

### [DOM-BI] Inteligencia de Negocio

- **DS_VENTAS_DIARIAS:** Métricas de ventas por día
- **DS_RANKING_PRODUCTOS:** Top 5 productos por rotación
- **DS_CARTERA_CLIENTES:** Morosidad y deuda activa
- **KPIs:** Transacciones, Ingresos, Inventario, Cartera

---

## 💾 Persistencia

### LocalStorageEngine

#### Estructura Base

```javascript
{
  "version": "1.0.0",
  "timestamp": "2026-05-09T12:34:56Z",
  "data": {
    "usuarios": [],
    "productos": [],
    "ventas": [],
    "clientes": [],
    "configuracion": {},
    "auditorias": []
  }
}
```

#### Métodos Clave

```javascript
LocalStorageEngine.init()        // Inicializar
LocalStorageEngine.get(domain)   // Obtener datos
LocalStorageEngine.set(domain)   // Persistir datos
LocalStorageEngine.syncCheck()   // Validar integridad
LocalStorageEngine.export()      // Auditoría
```

---

## 📱 Vistas Implementadas (10-20 pantallas)

### Autenticación

1. **Login Page** - Inicio de sesión con selección de rol

### Navegación Base

2. **Sidebar** - Menú lateral filtrado por permisos
2. **Notification System** - Alertas contextuales

### Dashboard [DOM-BI]

4. **Dashboard Principal** - KPIs, alertas de stock, cartera
2. **Skeleton Screens** - Simulación de carga de datos

### Punto de Venta [DOM-POS]

6. **POS - Búsqueda de Productos** - Con debounce
2. **POS - Carrito** - Gestión de items y totales
3. **POS - Selección de Cliente** - Modal para asignar cliente
4. **POS - Finalización** - Cálculo de pagos y cambio

### Inventario [DOM-INV]

10. **Inventario - Listado** - Tabla con estado de stock
2. **Inventario - Crear Producto** - Formulario de registro
3. **Inventario - Alertas** - Productos con stock bajo/agotado

### Clientes [DOM-PAGOS]

13. **Clientes - Listado** - Con saldo pendiente
2. **Clientes - Crear Cliente** - Formulario de registro
3. **Clientes - Detalles** - Modal con historial de ventas
4. **Clientes - Cartera** - Visualización de morosidad

### Reportes [DOM-BI]

17. **Reportes - KPIs** - Transacciones, ingresos, inventario, cartera
2. **Reportes - Top Productos** - Ranking por rotación
3. **Reportes - Cartera** - Detalles de morosidad
4. **Reportes - Exportar** - Descarga en JSON

---

## 🚀 Instrucciones de Inicio

### 1. Instalación de Dependencias

```bash
npm install
```

### 2. Iniciar Servidor de Desarrollo

```bash
npm run dev
```

Accede a: `http://localhost:5173`

### 3. Construir para Producción

```bash
npm run build
```

### 4. Preview de Producción

```bash
npm run preview
```

---

## 🎯 Estados de Venta

| Estado | Descripción |
| --- | --- |
| **PAGADA** | Transacción cerrada exitosamente |
| **SALDO_PENDIENTE** | Mercancía entregada con deuda activa |
| **ANULADA** | Transacción revertida y stock restaurado |

---

## 📊 Formato de Respuestas (The Wrapper)

Todas las respuestas de servicios siguen esta estructura:

```javascript
{
  "estado": "exito | error",
  "datos": { /* objeto con datos */ },
  "mensaje": "Mensaje descriptivo en español"
}
```

### Ejemplo

```javascript
{
  "estado": "exito",
  "datos": {
    "id": "VTA_1620000000000",
    "numero": "VTA-2026-05-09-1234",
    "total": 150000,
    "estado": "PAGADA"
  },
  "mensaje": "Venta VTA-2026-05-09-1234 registrada"
}
```

---

## 🔑 Características Clave

### ✅ Alta Fidelidad UX

- Skeleton Screens para simulación de carga
- Notificaciones contextuales
- Sidebar colapsable
- Interfaz responsive (mobile-first)

### ✅ Lógica de Negocio

- Debounce en búsquedas
- Validación de stock atómico
- Cálculo de IVA (19%)
- Registro automático de deuda

### ✅ Auditoría

- Logging de eventos (LOGIN, LOGOUT, etc.)
- Historial de operaciones
- Integridad de datos con syncCheck()
- Exportación de reportes

### ✅ Seguridad

- RBAC completo por permiso
- Filtrado de menú por perfil
- Validación en cada operación
- Cierre de sesión automático

---

## 🛠️ Tecnologías

```json
{
  "framework": "React 18+",
  "build": "Vite",
  "styles": "Tailwind CSS (mobile-first)",
  "routing": "React Router v6",
  "icons": "Lucide React",
  "persistence": "LocalStorage",
  "language": "JavaScript (ES6+)"
}
```

---

## 📝 Notas de Desarrollo

### Data Inicial (Demo)

El sistema carga automáticamente datos demo para:

- 5 productos de ejemplo
- 3 clientes de demostración
- 2 usuarios (admin, vendedor)

### Limitaciones del Prototipo

- **Persistencia:** LocalStorage (no para producción)
- **Autenticación:** Simulada (no validar contraseña realmente)
- **API:** Sin backend real (todo local)
- **Escalabilidad:** Diseñado para prototipo, no producción

### Próximos Pasos (Producción)

1. Conectar a backend real
2. Implementar autenticación JWT
3. Usar base de datos (PostgreSQL/MongoDB)
4. Agregar reportes en PDF
5. Sincronización offline-online
6. Certificado SSL/TLS

---

## 📞 Contacto y Soporte

Este es un prototipo de demostración del sistema PUNTO COM.  
Para reportar bugs o solicitudes: [crear issue en el repositorio]
