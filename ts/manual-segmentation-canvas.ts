export class ManualSegmentationCanvas {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  private canContinue: boolean;
  private imgData: ImageData;
  constructor(canvasName) {
    this.canvas  = document.getElementById(canvasName) as any;
    this.ctx = this.canvas.getContext("2d");
    this.canContinue = false;
  }
  set image(value: HTMLImageElement) {
    this.ctx.drawImage(value, 0, 0);
    this.imgData = this.ctx.getImageData(0, 0, value.width, value.height);
  }
  public reset() {
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
  public start() {
    this.canContinue = true;
    this.tick();
  }
  public stop() {
    this.canContinue = false;
  }
  private tick() {
    // Lógica de desenhar pixels do objeto

    if (this.canContinue) {
      window.requestAnimationFrame(this.tick.bind(this));
    }
  }

}
