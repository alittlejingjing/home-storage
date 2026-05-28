import type { ISystemRepository, ICategoryRepository, IBackupRepository } from './types'
import { LocalSystemRepository } from './local/systemRepository'
import { LocalCategoryRepository } from './local/categoryRepository'
import { LocalBackupRepository } from './local/backupRepository'

/** V1 工厂函数：后续替换为 HttpSystemRepository 即可迁移到 V2 */
export function getSystemRepository(): ISystemRepository {
  return new LocalSystemRepository()
}

/** V1 工厂函数：后续替换为 HttpCategoryRepository 即可迁移到 V2 */
export function getCategoryRepository(): ICategoryRepository {
  return new LocalCategoryRepository()
}

/** V1 工厂函数：后续替换为 HttpBackupRepository 即可迁移到 V2 */
export function getBackupRepository(): IBackupRepository {
  return new LocalBackupRepository()
}
