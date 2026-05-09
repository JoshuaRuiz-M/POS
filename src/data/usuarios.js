export const ROLES = {
    ADMIN: 'ADMIN',
    VENDEDOR: 'VENDEDOR',
}

export const PERMISOS = {
    VENTA_CREAR: 'VENTA_CREAR',
    VENTA_ANULAR: 'VENTA_ANULAR',
    INV_GESTION: 'INV_GESTION',
    REPORTE_VER: 'REPORTE_VER',
    USER_EDIT: 'USER_EDIT',
}

// Mapeo de permisos por rol
export const PERMISOS_POR_ROL = {
    [ROLES.ADMIN]: [
        PERMISOS.VENTA_CREAR,
        PERMISOS.VENTA_ANULAR,
        PERMISOS.INV_GESTION,
        PERMISOS.REPORTE_VER,
        PERMISOS.USER_EDIT,
    ],
    [ROLES.VENDEDOR]: [
        PERMISOS.VENTA_CREAR,
    ],
}

export const obtenerDatosUsuarios = () => {
    return [
        {
            id: 'USR_ADMIN',
            nombre: 'Administrador General',
            email: 'admin@punto.com',
            password: 'admin123',
            rol: ROLES.ADMIN,
            activo: true,
        },
        {
            id: 'USR_VENDEDOR',
            nombre: 'Vendedor Operativo',
            email: 'vendedor@punto.com',
            password: 'vendedor123',
            rol: ROLES.VENDEDOR,
            activo: true,
        },
    ]
}


