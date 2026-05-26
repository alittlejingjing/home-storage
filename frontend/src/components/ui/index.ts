/**
 * UI 组件统一导出（vue3-example 脚手架）
 * 使用方式：import { Button, Input, Card } from '@/components/ui'
 */

// 基础组件
export { default as Button } from './Button.vue'
export { default as Input } from './Input.vue'
export { default as Label } from './Label.vue'
export { default as Textarea } from './Textarea.vue'
export { default as Checkbox } from './Checkbox.vue'
export { default as Switch } from './Switch.vue'
export { default as Slider } from './Slider.vue'
export { default as Separator } from './Separator.vue'
export { default as Badge } from './Badge.vue'
export { default as Skeleton } from './Skeleton.vue'
export { default as Empty } from './Empty.vue'
export { default as Code } from './Code.vue'
export { default as Progress } from './Progress.vue'
export { default as ScrollArea } from './ScrollArea.vue'
export { default as Image } from './Image.vue'
export { default as Tooltip } from './Tooltip.vue'
export { default as Popover } from './Popover.vue'
export { default as Calendar } from './Calendar.vue'
export { default as DatePicker } from './DatePicker.vue'
export { default as RichTextEditor } from './RichTextEditor.vue'
export { default as Upload } from './Upload.vue'

// Card 系列
export { default as Card } from './Card.vue'
export { default as CardHeader } from './CardHeader.vue'
export { default as CardTitle } from './CardTitle.vue'
export { default as CardDescription } from './CardDescription.vue'
export { default as CardContent } from './CardContent.vue'
export { default as CardFooter } from './CardFooter.vue'

// Alert 系列
export { default as Alert } from './Alert.vue'
export { default as AlertTitle } from './AlertTitle.vue'
export { default as AlertDescription } from './AlertDescription.vue'

// Avatar 系列
export { default as Avatar } from './Avatar.vue'
export { default as AvatarImage } from './AvatarImage.vue'
export { default as AvatarFallback } from './AvatarFallback.vue'

// Command 系列
export { default as Command } from './Command.vue'
export { default as CommandList } from './CommandList.vue'
export { default as CommandItem } from './CommandItem.vue'

// 目录组件
export { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './accordion'
export { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from './breadcrumb'
export { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from './carousel'
export { ContextMenu, ContextMenuContent, ContextMenuItem } from './context-menu'
export { Dialog, DialogContent, DialogOverlay, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from './dialog'
export { Drawer, DrawerContent, DrawerOverlay, DrawerHeader, DrawerFooter, DrawerTitle, DrawerDescription } from './drawer'
export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from './dropdown-menu'
export { RadioGroup, RadioGroupItem } from './radio'
export { Table, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell, TableCaption } from './table'
export { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs'
export { Toast, Toaster, useToast, toast } from './toast'
export type { ToastItem } from './toast'

// 已有目录组件
export { Chart } from './chart'
export type { ChartType, ChartTheme } from './chart'
export { Select, SelectOption } from './select'
export { Stepper } from './stepper'
export { PaginationBar } from './pagination'
export { MapView } from './map-view'
export type { MapMarker } from './map-view'
