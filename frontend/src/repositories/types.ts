import type { Category, CategoryCreateInput, CategoryDeleteStrategy, CategoryOrderInput } from '@/types/category'
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

export interface ICategoryRepository {
  list(): Promise<CategoryVO[]>
  getById(id: string): Promise<Category | null>
  create(dto: CategoryCreateInput): Promise<string>
  update(id: string, dto: Partial<CategoryCreateInput>): Promise<boolean>
  delete(id: string, strategy: CategoryDeleteStrategy): Promise<boolean>
  reorder(orders: CategoryOrderInput[]): Promise<void>
  getItemCount(categoryId: string): Promise<number>
}

export interface ISystemRepository {
  getStats(): Promise<{ totalItems: number; totalCabinets: number; totalCategories: number }>
  clearCache(): Promise<void>
}
