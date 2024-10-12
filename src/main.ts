import shaderSource from "./shaders/shader.wgsl?raw";

class Renderer {
  private context!: GPUCanvasContext;
  private device!: GPUDevice;

  public async initialize() {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;

    this.context = canvas.getContext("webgpu")!;

    if (!navigator.gpu) {
      throw Error("WebGPU not supported.");
    }

    if (!this.context) {
      alert("WebGPU not supported");
      return;
    }

    const adapter = await navigator.gpu.requestAdapter({
      powerPreference: "low-power",
    });

    if (!adapter) {
      alert("No Adapter found");
      return;
    }

    this.device = await adapter.requestDevice();

    this.context.configure({
      device: this.device,
      format: navigator.gpu.getPreferredCanvasFormat(),
    });

    this.prepareModel();
  }

  private prepareModel() {
    const shaderModule = this.device.createShaderModule({
      code: shaderSource,
    });

    const vertexState: GPUVertexState = {
      module: shaderModule,
      entryPoint: "vertexMain",
      buffers: [],
    };

    const fragmentState: GPUFragmentState = {
      module: shaderModule,
      entryPoint: "fragmentMain",
      targets: [
        {
          format: navigator.gpu.getPreferredCanvasFormat(),
        },
      ],
    };

    this.pipeline = this.device.createRenderPipeline({
      vertex: vertexState,
      fragment: fragmentState,
      primitive: {
        topology: "triangle-list",
      },
      layout: "auto",
    });
  }

  public draw(): void {
    const commandEncoder = this.device.createCommandEncoder();

    const textureView = this.context.getCurrentTexture().createView();

    const renderPassDescriptor: GPURenderPassDescriptor = {
      colorAttachments: [
        {
          view: textureView,
          clearValue: { r: 0.8, g: 0.8, b: 1, a: 1.0 },
          loadOp: "clear",
          storeOp: "store",
        },
      ],
    };

    const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);

    //todo: draw stuff here
    passEncoder.setPipeline(this.pipeline);
    passEncoder.draw(3);

    passEncoder.end();
    this.device.queue.submit([commandEncoder.finish()]);
  }
}

const renderer = new Renderer();
renderer.initialize().then(() => renderer.draw());
