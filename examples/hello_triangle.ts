import { WinitWindow } from "../mod.ts";

const shaderCode = `
@vertex
fn vs_main(@builtin(vertex_index) in_vertex_index: u32) -> @builtin(position) vec4<f32> {
    let x = f32(i32(in_vertex_index) - 1);
    let y = f32(i32(in_vertex_index & 1u) * 2 - 1);
    return vec4<f32>(x, y, 0.0, 1.0);
}

@fragment
fn fs_main() -> @location(0) vec4<f32> {
    return vec4<f32>(1.0, 0.0, 0.0, 1.0);
}
`;

const windowTitle = "Hello Triangle";
const windowIconPath = Deno.realPathSync("assets/icon.png");
const presentationFormat = "bgra8unorm";
let renderPipeline: GPURenderPipeline | null = null;

const setupFunction = (device: GPUDevice, _context: GPUCanvasContext) => {
  const shaderModule = device.createShaderModule({
    code: shaderCode,
  });

  const pipelineLayout = device.createPipelineLayout({
    bindGroupLayouts: [],
  });

  renderPipeline = device.createRenderPipeline({
    layout: pipelineLayout,
    vertex: {
      module: shaderModule,
      entryPoint: "vs_main",
    },
    fragment: {
      module: shaderModule,
      entryPoint: "fs_main",
      targets: [
        {
          format: presentationFormat,
        },
      ],
    },
  });
};

const drawFunction = (device: GPUDevice, context: GPUCanvasContext) => {
  if (!renderPipeline) {
    console.error("Pipeline not initialized.");
    return;
  }

  const encoder = device.createCommandEncoder();
  const texture = context.getCurrentTexture().createView();
  const renderPass = encoder.beginRenderPass({
    colorAttachments: [
      {
        view: texture,
        storeOp: "store",
        loadOp: "clear",
        clearValue: { r: 0, g: 1, b: 0, a: 1.0 },
      },
    ],
  });
  renderPass.setPipeline(renderPipeline);
  renderPass.draw(3, 1);
  renderPass.end();
  device.queue.submit([encoder.finish()]);
};

const resizeFunction = (width: number, height: number) => {
  console.log(`Resized to ${width}x${height}.`);
};

const window = new WinitWindow({
  windowTitle,
  windowIconPath,
  presentationFormat,
  setupFunction,
  drawFunction,
  resizeFunction,
});
window.spawn();
