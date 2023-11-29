import { watch, type Ref } from 'vue'
import { useElementSize, computedEager, useMouse, useDebounceFn, unrefElement } from '@vueuse/core'

export class Queue<T> {
  private queue: T[] = []

  constructor(private readonly maxLength: number) {}

  get length(): number {
    return this.queue.length
  }

  public enqueue(item: T): T | undefined {
    if (this.queue.includes(item)) {
      return
    }
    this.queue.push(item)
    if (this.queue.length > this.maxLength) {
      return this.queue.shift()
    }
  }

  public dequeue(): T | undefined {
    return this.queue.shift()
  }

  public clear(): void {
    this.queue = []
  }

  public forEach(callback: (item: T, index: number) => void): void {
    this.queue.forEach(callback)
  }

  public has(item: T): boolean {
    return this.queue.includes(item)
  }
}

interface Dot {
  readonly x: number
  readonly y: number
}

function hitDot(dot: Dot, x: number, y: number, tolerance: number): boolean {
  const dx = dot.x - x
  const dy = dot.y - y
  const distance = Math.sqrt(dx * dx + dy * dy)
  return distance <= tolerance
}

function drawBg(ctx: CanvasRenderingContext2D, dots: Dot[]) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  dots.forEach((dot) => {
    ctx.beginPath()
    ctx.arc(dot.x, dot.y, 1, 0, Math.PI * 2)
    ctx.closePath()
    ctx.fillStyle = '#525252'
    ctx.fill()
  })
}

function drawQueue(ctx: CanvasRenderingContext2D, queue: Queue<Dot>) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  queue.forEach((dot, index) => {
    const { x, y } = dot
    const size = Math.min(queue.length - index + 0.5, 8)
    const startX = x - size / 2
    const startY = y - size / 2
    const radius = Math.min(Math.round(size / 2), 2)

    ctx.beginPath()

    // 绘制左上角圆角
    ctx.moveTo(startX + radius, startY)
    ctx.arcTo(startX + size, startY, startX + size, startY + radius, radius)

    // 绘制右上角圆角
    ctx.lineTo(startX + size, startY + size - radius)
    ctx.arcTo(startX + size, startY + size, startX + size - radius, startY + size, radius)

    // 绘制右下角圆角
    ctx.lineTo(startX + radius, startY + size)
    ctx.arcTo(startX, startY + size, startX, startY + size - radius, radius)

    // 绘制左下角圆角
    ctx.lineTo(startX, startY + radius)
    ctx.arcTo(startX, startY, startX + radius, startY, radius)

    ctx.closePath()

    // 填充颜色
    ctx.fillStyle = getColor('#a5b4fc', '#1e1b4b', index / queue.length)
    ctx.fill()
  })
}

function getColor(colorStart: string, colorEnd: string, percent: number): string {
  const start = hexToRgb(colorStart)
  const end = hexToRgb(colorEnd)
  const r = Math.round(start.r + (end.r - start.r) * percent)
  const g = Math.round(start.g + (end.g - start.g) * percent)
  const b = Math.round(start.b + (end.b - start.b) * percent)
  return rgbToHex(r, g, b)
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return { r, g, b }
}

function rgbToHex(r: number, g: number, b: number): string {
  const rHex = r.toString(16).padStart(2, '0')
  const gHex = g.toString(16).padStart(2, '0')
  const bHex = b.toString(16).padStart(2, '0')
  return `#${rHex}${gHex}${bHex}`
}

function createCanvas(): HTMLCanvasElement {
  const el = document.createElement('canvas')
  el.style.position = 'absolute'
  el.style.width = '100%'
  el.style.height = '100%'
  return el
}

export interface UseInteractiveBackgroundOptions {
  target: Ref<HTMLElement | undefined>
  gap: number
  queueSize: number
}
export function useInteractiveBackground(options: UseInteractiveBackgroundOptions) {
  const { gap, queueSize, target } = options

  const { width, height } = useElementSize(target)
  const { x: mouseX, y: mouseY } = useMouse({ target })

  const activeQueue = new Queue<Dot>(queueSize)
  const dots = computedEager<Dot[]>(() => {
    const row = Math.round(width.value / gap) - 1
    const columns = Math.round(height.value / gap) - 1
    const result: Dot[] = []
    for (let i = 0; i < row; i++) {
      const x = (i + 1) * gap
      for (let j = 0; j < columns; j++) {
        const y = (j + 1) * gap
        result.push({ x, y })
      }
    }
    return result
  })

  const bgEl = createCanvas()
  const canvasEl = createCanvas()

  const bgCtx = bgEl.getContext('2d', { alpha: false })
  const canvasCtx = canvasEl.getContext('2d')

  const reset = () => {
    if (bgCtx) {
      bgEl.width = width.value
      bgEl.height = height.value
      drawBg(bgCtx, dots.value)
    }
    activeQueue.clear()
    if (canvasCtx) {
      canvasEl.width = width.value
      canvasEl.height = height.value
      drawQueue(canvasCtx, activeQueue)
    }
  }

  let clearTimer: number | undefined
  const clearQueue = useDebounceFn(() => {
    clearTimer = setInterval(() => {
      if (activeQueue.length > 0) {
        activeQueue.dequeue()
        if (canvasCtx) {
          drawQueue(canvasCtx, activeQueue)
        }
      } else {
        clearInterval(clearTimer)
        clearTimer = undefined
      }
    }, 10)
  }, 500)

  const unwatch = watch(
    () => unrefElement(target),
    (ele) => {
      if (ele) {
        unwatch()
        ele.appendChild(bgEl)
        ele.appendChild(canvasEl)
      }
    }
  )

  watch(dots, reset, { immediate: true })

  watch([mouseX, mouseY], ([x, y]) => {
    if (clearTimer) {
      clearInterval(clearTimer)
      clearTimer = undefined
    }
    const item = dots.value.find((dot) => hitDot(dot, x, y, gap / 2 + 0.9))
    if (item && !activeQueue.has(item)) {
      activeQueue.enqueue(item)

      if (canvasCtx) {
        drawQueue(canvasCtx, activeQueue)
      }
    }
    clearQueue()
  })
}
