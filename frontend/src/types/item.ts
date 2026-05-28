export interface ItemVO {
    id: string
    name: string
    categoryId: string
    photos: string[]
    storageDate: string
    cabinetId: string
    note: string
    createdAt: string
}

export interface ItemBrief {
    id: string
    name: string
    categoryId: string
    cabinetId: string
    storageDate: string
    photo?: string
}

export interface ItemFilters {
    keyword?: string
    categoryId?: string
    dateStart?: string
    dateEnd?: string
}
