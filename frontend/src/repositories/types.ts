import type { ItemVO, ItemFilters, ItemBrief } from '@/types/item'
import type { Cabinet, CabinetVO, CabinetFilters, CabinetCreateInput } from '@/types/cabinet'

export interface IItemRepository {
  create(item: Omit<ItemVO, 'id' | 'createdAt'>): Promise<ItemVO>
  update(id: string, item: Partial<Omit<ItemVO, 'id' | 'createdAt'>>): Promise<ItemVO | null>
  delete(id: string): Promise<boolean>
  list(filters?: ItemFilters): Promise<ItemVO[]>
  getById(id: string): Promise<ItemVO | null>
}

export interface ICabinetRepository {
  list(filters?: CabinetFilters): Promise<CabinetVO[]>
  getById(id: string): Promise<CabinetVO | null>
  create(dto: CabinetCreateInput): Promise<Cabinet>
  update(id: string, dto: Partial<CabinetCreateInput>): Promise<Cabinet | null>
  delete(id: string): Promise<boolean>
  listItemsInCabinet(cabinetId: string): Promise<ItemBrief[]>
  uploadPhoto(id: string, file: File): Promise<string>
  deletePhoto(id: string, index: number): Promise<boolean>
}
