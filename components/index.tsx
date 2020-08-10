import React from 'react'

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
  private initScale: number = 1.0 // 初始化缩放大小
  private imgWidth: number = 0 // 图片宽
  private imgHeight: number = 0 // 图片高

  public componentDidMount() {
    const { src } = this.props
    this.init()
    this.draw(src)
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
  }

  public render() {
    const { src, width, height, style = {}, ...otherProps } = this.props
    return (
      <>
        <canvas
          {...otherProps}
          style={{ ...style, width, height }}
          ref={this.getCanvas}
          width={width}
          height={height}
          onWheel={this.handleWheel(50)}
        />
        <canvas
          {...otherProps}
          style={{ ...style, width, height, display: 'none' }}
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
    }
  }

  // 释放引用
  private destroy = () => {
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
        this.imgWidth = iWidth
        this.imgHeight = iHeight
        const scale = this.getInitScale(width, height, img.width, img.height)

        this.initScale = scale
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
    return parseFloat(Math.min(wScale, hScale).toFixed(2))
  }

  // 滚动事件
  private handleWheel = (time: number) => {
    let drawing = false
    let timer: any = null
    return (e: any) => {
      if (drawing) {
        return
      }
      drawing = true
      if (timer) {
        clearTimeout(timer)
      }

      timer = setTimeout(() => {
        drawing = false
      }, time)

      const { deltaX, deltaY, clientX, clientY } = e
      const { x, y } = e.target.getBoundingClientRect()
      let deltaScale = deltaY > 0 ? 0.01 : -0.01
      const scale = parseInt(`${(this.scale + deltaScale) * 100}`)
      if (scale <= 10) {
        this.scale = 0.1
      } else {
        this.scale = scale / 100
      }
      if (this.lastScale !== this.scale) {
        this.lastScale = this.scale
        this.redrawImage(this.scale)
      }
    }
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
    const x = (width - dW) / 2
    const y = (height - dH) / 2
    return [x, y, dW, dH]
  }
}

export default ImageClip
