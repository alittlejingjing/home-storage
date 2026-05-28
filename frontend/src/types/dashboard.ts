/**
 * @file dashboard.ts
 * @version 1.0.0
 * @author wuwg <wuwg@thunisoft.com>
 * @createTime 2026-05-27
 * @copyright thunisoft fd
 * @see [jsDoc中文文档]{@link http://www.dba.cn/book/jsdoc/JSDOCKuaiBiaoQianBLOCKTAGS/CONSTRUCTS.html}
 * @description 首页仪表盘 VO，与详细设计_搜索与仪表盘.md 对齐
 * @updateTime 2026-05-27
 */

export interface ItemBrief {
    id: string
    name: string
    cabinetId: string
    cabinetName?: string
    categoryId?: string
    createdAt: string
}

export interface CategoryStat {
    categoryId: string
    name: string
    count: number
    color?: string
    icon?: string
}

export interface DashboardVO {
    categoryStats: CategoryStat[]
    totalItems: number
    totalCabinets: number
}
