import { WindLayerOptions, WindData } from './types';
import { WindParticlesComputing } from './windParticlesComputing';
import { WindParticlesRendering } from './windParticlesRendering';
import CustomPrimitive from './customPrimitive';
import { ClearCommand, Color, Pass } from 'cesium';

export class WindParticleSystem {
  computing: WindParticlesComputing;
  rendering: WindParticlesRendering;
  windData: WindData;
  options: WindLayerOptions;
  viewerParameters: any;
  context: any;
  constructor(context: any, windData: WindData, options: WindLayerOptions, viewerParameters: any) {
    this.context = context;
    this.windData = windData;
    this.options = options;
    this.viewerParameters = viewerParameters;
    this.computing = new WindParticlesComputing(context, windData, options, viewerParameters);
    this.rendering = new WindParticlesRendering(context, options, viewerParameters, this.computing);
    this.clearFramebuffers();
  }

  getPrimitives(): CustomPrimitive[] {
    const primitives = [
      this.computing.primitives.calculateSpeed,
      this.computing.primitives.updatePosition,
      this.computing.primitives.postProcessingPosition,
      this.rendering.primitives.segments,
    ];

    return primitives;
  }

  updateWindData(data: WindData): void {
    this.computing.updateWindData(data);
  }

  clearFramebuffers() {
    const clearCommand = new ClearCommand({
      color: new Color(0.0, 0.0, 0.0, 0.0),
      depth: 1.0,
      framebuffer: undefined,
      pass: Pass.OPAQUE
    });

    Object.keys(this.rendering.framebuffers).forEach((key) => {
      clearCommand.framebuffer = this.rendering.framebuffers[key as keyof typeof this.rendering.framebuffers];
      clearCommand.execute(this.context);
    });
  }

  changeOptions(options: Partial<WindLayerOptions>) {
    let maxParticlesChanged = false;
    if (this.options.particlesTextureSize && this.options.particlesTextureSize !== options.particlesTextureSize) {
      maxParticlesChanged = true;
    }

    const newOptions = {
      ...this.options,
      ...options
    }
    if (newOptions.particlesTextureSize < 1) {
      throw new Error('particlesTextureSize must be greater than 0');
    }
    this.options = newOptions;

    this.rendering.updateOptions(options);
    this.computing.updateOptions(options);
    if (maxParticlesChanged) {
      this.computing.destroyParticlesTextures();
      this.computing.createParticlesTextures();
      this.rendering.onParticlesTextureSizeChange();
    }
  }

  applyViewerParameters(viewerParameters: any): void {
    this.viewerParameters = viewerParameters;
    this.computing.viewerParameters = viewerParameters;
    this.rendering.viewerParameters = viewerParameters;
  }

  destroy(): void {
    this.computing.destroy();
    this.rendering.destroy();
  }
}