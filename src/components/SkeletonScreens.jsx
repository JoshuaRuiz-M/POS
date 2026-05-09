/**
 * [DOM-BI] Skeleton Screens para simulación de carga
 */

export function SkeletonCard() {
    return (
        <div className="bg-gray-200 rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-6 bg-gray-300 rounded w-1/2"></div>
        </div>
    )
}

export function SkeletonTable() {
    return (
        <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded h-10 animate-pulse"></div>
            ))}
        </div>
    )
}

export function SkeletonDashboard() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <SkeletonCard key={i} />
                ))}
            </div>
            <SkeletonTable />
        </div>
    )
}
