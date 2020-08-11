import React from 'react'

import { stopImmediatePropagation } from './utils'

const ImageType = {
  png: { value: 'image/png', suffix: 'png' },
  jpeg: { value: 'image/jpeg', suffix: 'jpeg' },
  bmp: { value: 'image/bmp', suffix: 'bmp' },
  webp: { value: 'image/webp', suffix: 'webp' },
  icon: { value: 'image/x-icon', suffix: 'ico' },
}

interface IProps
  extends React.DetailedHTMLProps<
    React.CanvasHTMLAttributes<HTMLCanvasElement>,
    HTMLCanvasElement
  > {
  src: string // 图片的来源
  width: number // 绘制区域宽度
  height: number // 绘制区域高度
}
class ImageClip extends React.PureComponent<IProps> {
  private canvas: HTMLCanvasElement | null = null
  private canvasCtx: CanvasRenderingContext2D | null = null
  private hiddenCanvas: HTMLCanvasElement | null = null
  private hiddenCanvasCtx: CanvasRenderingContext2D | null = null

  private scale: number = 1 // 缩放大小
  private lastScale: number = 1 // 上次缩放大小

  private moving: boolean = false
  private movingX: number = 0
  private movingY: number = 0

  private requestAnimationFrameId: number = 0

  public componentDidMount() {
    const { src } = this.props
    this.init()
    this.draw(src)

    this.requestAnimationFrameId = window.requestAnimationFrame(
      this.requestAnimationFrame,
    )
  }

  public componentDidUpdate(prevProps: IProps) {
    const { src: oldSrc } = prevProps
    const { src } = this.props
    if (src !== oldSrc && src) {
      this.draw(src)
    }
  }

  public componentWillUnmount() {
    this.destroy()

    window.cancelAnimationFrame(this.requestAnimationFrameId)
  }

  public exportImage = (
    type: keyof typeof ImageType,
    name: string,
    quality: number,
  ) => {
    if (ImageType[type] && this.canvas) {
      const { value, suffix } = ImageType[type]
      const imgURL = this.canvas.toDataURL(value, quality)
      const fileName = `${name}.${suffix}`
      const dlLink = document.createElement('a')
      dlLink.download = fileName
      dlLink.href = imgURL
      dlLink.dataset.downloadUrl = [value, dlLink.download, dlLink.href].join(
        ':',
      )

      document.body.appendChild(dlLink)
      dlLink.click()
      document.body.removeChild(dlLink)
    }
  }

  public render() {
    const { src, width, height, style = {}, ...otherProps } = this.props
    return (
      <>
        <canvas
          {...otherProps}
          style={{ ...style, width, height, touchAction: 'none' }}
          ref={this.getCanvas}
          width={width}
          height={height}
          onWheel={this.handleWheel}
          onMouseDown={this.handleMouseDown}
          onMouseMove={this.handleMouseMove}
          onMouseLeave={this.handleMouseLeave}
          onMouseUp={this.handleMouseUp}
        />
        <canvas
          {...otherProps}
          style={{
            ...style,
            width,
            height,
            display: 'none',
            touchAction: 'none',
          }}
          width={width}
          height={height}
          ref={this.getHiddenCanvas}
        />
      </>
    )
  }

  private getCanvas = (ele: any) => (this.canvas = ele)
  private getHiddenCanvas = (ele: any) => (this.hiddenCanvas = ele)

  // 初始化获取 canvas 上下文
  private init = () => {
    if (this.canvas && this.hiddenCanvas) {
      this.canvasCtx = this.canvas.getContext('2d')
      this.hiddenCanvasCtx = this.hiddenCanvas.getContext('2d')

      this.canvas.addEventListener('wheel', this.handleWheel, {
        passive: false,
      })
    }
  }

  // 释放引用
  private destroy = () => {
    if (this.canvas) {
      this.canvas.removeEventListener('wheel', this.handleWheel)
    }
    this.canvas = null
    this.hiddenCanvas = null
    this.canvasCtx = null
    this.hiddenCanvasCtx = null
  }

  // 加载图片
  private loadImage = (imageSrc: string) => {
    const img = new Image()
    const p: Promise<HTMLImageElement> = new Promise((resolve, reject) => {
      img.onload = () => {
        resolve(img)
      }
      img.onerror = reject
    })
    img.src = imageSrc
    return p
  }

  // 绘制图片
  private draw = async (imageSrc: string) => {
    const { width, height } = this.props
    try {
      if (this.canvasCtx && this.hiddenCanvasCtx && width && height) {
        const img = await this.loadImage(imageSrc)
        this.canvasCtx.clearRect(0, 0, width, height)
        this.hiddenCanvasCtx.clearRect(0, 0, width, height)

        const { width: iWidth, height: iHeight } = img
        const scale = this.getInitScale(width, height, img.width, img.height)

        this.scale = scale
        this.lastScale = scale

        const dW = scale * iWidth
        const dH = scale * iHeight
        const x = (width - dW) / 2
        const y = (height - dH) / 2
        this.canvasCtx.drawImage(img, x, y, dW, dH)
        this.hiddenCanvasCtx.drawImage(img, x, y, dW, dH)
      }
    } catch (e) {
      //
    }
  }

  // 获取初始化的缩放比例和位置信息
  private getInitScale = (cw: number, ch: number, iw: number, ih: number) => {
    const wScale = cw / iw
    const hScale = ch / ih
    return Number(Math.min(wScale, hScale).toFixed(2))
  }

  // 滚动事件
  private handleWheel = (e: any) => {
    stopImmediatePropagation(e)

    const { deltaY } = e
    const deltaScale = deltaY > 0 ? 0.01 : -0.01
    const scale = this.scale + deltaScale
    if (scale <= 0.1) {
      this.scale = 0.1
    } else if (scale >= 5) {
      this.scale = 5
    } else {
      this.scale = scale
    }
  }

  // 鼠标按下事件
  private handleMouseDown = (e: any) => {
    this.moving = true
  }

  // 鼠标移动事件
  private handleMouseMove = (e: any) => {
    const { movementX, movementY } = e
    if (this.moving) {
      this.movingX += movementX
      this.movingY += movementY
    }
  }

  // 鼠标释放事件
  private handleMouseUp = (e: any) => {
    this.moving = false
  }

  // 鼠标移出事件
  private handleMouseLeave = (e: any) => {
    this.moving = false
  }

  // 重绘图片
  private requestAnimationFrame = () => {
    if (this.lastScale !== this.scale) {
      this.lastScale = this.scale
    }
    this.redrawImage(this.scale)
    this.requestAnimationFrameId = window.requestAnimationFrame(
      this.requestAnimationFrame,
    )
  }

  // 重绘制图片
  private redrawImage = (scale: number) => {
    const { width: cw, height: ch } = this.props
    if (this.canvasCtx && this.hiddenCanvas && cw && ch) {
      const [x, y, width, height] = this.getScaleInfo(scale)
      this.canvasCtx.clearRect(0, 0, cw, ch)
      this.canvasCtx.drawImage(this.hiddenCanvas, x, y, width, height)
    }
  }

  // 绘制缩放图片
  private getScaleInfo = (scale: number) => {
    const { width, height } = this.props
    const dW = scale * width
    const dH = scale * height
    const x = (width - dW) / 2 + this.movingX
    const y = (height - dH) / 2 + this.movingY
    return [x, y, dW, dH]
  }
}

export default ImageClip
