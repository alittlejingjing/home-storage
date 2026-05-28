export interface Category {
    id: string
    name: string
    sortOrder: number
    createdAt: string
    color?: string
    icon?: string
}

export interface CategoryVO extends Category {
    itemCount: number
}

export type CategoryCreateInput = {
    name: string
    color?: string
    icon?: string
}

export type CategoryDeleteStrategy = 'DELETE_ITEMS' | 'MOVE_TO_UNCATEGORIZED'

export type CategoryOrderInput = {
    id: string
    sortOrder: number
}
