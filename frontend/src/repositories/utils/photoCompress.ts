/**
 * 压缩图片为 base64
 * 规则：最大宽度 1280px，JPEG 质量 80%，目标 ≤200KB
 */
export function compressPhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const MAX_WIDTH = 1280
        let width = img.width
        let height = img.height
        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width)
          width = MAX_WIDTH
        }
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('无法创建 canvas context'))
          return
        }
        ctx.drawImage(img, 0, 0, width, height)
        // 质量 80%
        const base64 = canvas.toDataURL('image/jpeg', 0.8)
        resolve(base64)
      }
      img.onerror = reject
      img.src = reader.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
