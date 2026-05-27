import type { ItemVO, ItemFilters } from '@/types/item'

export interface IItemRepository {
  create(item: Omit<ItemVO, 'id' | 'createdAt'>): Promise<ItemVO>
  update(id: string, item: Partial<Omit<ItemVO, 'id' | 'createdAt'>>): Promise<ItemVO | null>
  delete(id: string): Promise<boolean>
  list(filters?: ItemFilters): Promise<ItemVO[]>
  getById(id: string): Promise<ItemVO | null>
}
