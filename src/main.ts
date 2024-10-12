class Renderer {
  private context: GPUCanvasContext | null = null;
  private device: GPUDevice | null = null;

  public async initialize() {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;

    if (!canvas) {
      console.error("Canvas element not found.");
      return;
    }

    if (!navigator.gpu) {
      throw new Error("WebGPU not supported.");
    }

    this.context = canvas.getContext("webgpu");
    if (!this.context) {
      alert("WebGPU context is not available.");
      return;
    }

    const adapter = await navigator.gpu.requestAdapter({
      powerPreference: "low-power",
    });

    if (!adapter) {
      alert("No Adapter found.");
      return;
    }

    this.device = await adapter.requestDevice();
    if (!this.device) {
      alert("Unable to request GPU device.");
      return;
    }

    this.context.configure({
      device: this.device,
      format: navigator.gpu.getPreferredCanvasFormat(),
    });
  }

  public draw() {
    if (!this.device || !this.context) {
      console.error("Device or context is not initialized.");
      return;
    }

    const commandEncoder = this.device.createCommandEncoder();

    const textureView = this.context.getCurrentTexture().createView();

    const renderPassDescriptor: GPURenderPassDescriptor = {
      colorAttachments: [
        {
          view: textureView,
          clearValue: { r: 0.8, g: 0.8, b: 0.8, a: 1.0 },
          loadOp: "clear",
          storeOp: "store",
        },
      ],
    };

    const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);

    // Todo: draw stuff here

    passEncoder.end();
    this.device.queue.submit([commandEncoder.finish()]);
  }
}

const renderer = new Renderer();
renderer.initialize().then(() => {
  renderer.draw();
});
