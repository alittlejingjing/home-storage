export type BackupImportMode = 'MERGE' | 'OVERWRITE'

export interface BackupData {
    version: string
    exportedAt: string
    items: Array<{
        id: string
        name: string
        categoryId: string
        photos: string[]
        storageDate: string
        cabinetId: string
        note: string
        createdAt: string
    }>
    cabinets: Array<{
        id: string
        name: string
        photos: string[]
        location: string
        createdAt: string
    }>
    categories: Array<{
        id: string
        name: string
        sortOrder: number
        createdAt: string
        color?: string
        icon?: string
    }>
    itemPhotos?: Record<string, string[]>
    cabinetPhotos?: Record<string, string[]>
}

export interface BackupValidationResult {
    valid: boolean
    error?: string
}

export interface ImportResult {
    items: number
    cabinets: number
    categories: number
}
