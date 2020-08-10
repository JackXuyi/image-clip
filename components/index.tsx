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
    const { src, width, style = {}, ...otherProps } = this.props
    return (
      <>
        <canvas {...otherProps} style={style} ref={this.getCanvas} />
        <canvas
          {...otherProps}
          style={{ ...style, display: 'none' }}
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
        const scale = this.getInitScale(width, height, img.width, img.height)

        const x = (width - scale * iWidth) / 2
        const y = (height - scale * iHeight) / 2
        this.canvasCtx.drawImage(img, x, y, width, height)
        this.hiddenCanvasCtx.drawImage(img, x, y, width, height)
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
}

export default ImageClip
