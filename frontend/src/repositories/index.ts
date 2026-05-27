import type { ISystemRepository } from './types'
import { LocalSystemRepository } from './local/systemRepository'

/** V1 工厂函数：后续替换为 HttpSystemRepository 即可迁移到 V2 */
export function getSystemRepository(): ISystemRepository {
  return new LocalSystemRepository()
}
