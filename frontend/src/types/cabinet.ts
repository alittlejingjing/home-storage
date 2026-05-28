export interface Cabinet {
    id: string
    name: string
    photos: string[]
    location: string
    createdAt: string
}

export interface CabinetVO extends Cabinet {
    itemCount: number
}

export interface CabinetFilters {
    keyword?: string
    dateStart?: string
    dateEnd?: string
}

export interface CabinetCreateInput {
    name: string
    photos: string[]
    location: string
}
