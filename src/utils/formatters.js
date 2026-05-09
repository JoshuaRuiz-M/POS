export function formatearGTQ(valor) {
    const numero = Number(valor || 0)
    return `Q${numero.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatearFechaGT(fecha) {
    if (!fecha) return '-'
    return new Date(fecha).toLocaleString('es-GT')
}

export function formatearFechaCortaGT(fecha) {
    if (!fecha) return '-'
    return new Date(fecha).toLocaleDateString('es-GT')
}