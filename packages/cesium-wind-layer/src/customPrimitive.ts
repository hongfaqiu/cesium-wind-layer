import {
  Geometry,
  ShaderProgram,
  VertexArray,
  DrawCommand,
  RenderState,
  Pass,
  PrimitiveType,
  ShaderSource,
  ClearCommand,
  Color,
  defined,
  ComputeCommand,
  Matrix4,
  BufferUsage,
  destroyObject,
} from 'cesium';

interface CustomPrimitiveOptions {
  isDynamic?: () => boolean;
  commandType: 'Draw' | 'Compute';
  geometry?: Geometry;
  attributeLocations?: { [key: string]: number };
  primitiveType?: PrimitiveType;
  uniformMap?: { [key: string]: () => any };
  vertexShaderSource?: ShaderSource;
  fragmentShaderSource: ShaderSource;
  rawRenderState?: any;
  framebuffer?: any;
  outputTexture?: any;
  autoClear?: boolean;
  preExecute?: () => void;
}

export default class CustomPrimitive {
  commandType: 'Draw' | 'Compute';
  geometry?: Geometry;
  attributeLocations?: { [key: string]: number };
  primitiveType?: PrimitiveType;
  uniformMap: { [key: string]: () => any };
  vertexShaderSource?: ShaderSource;
  fragmentShaderSource: ShaderSource;
  rawRenderState: any;
  framebuffer?: any;
  outputTexture?: any;
  autoClear: boolean;
  preExecute?: () => void;
  show: boolean;
  commandToExecute?: DrawCommand | ComputeCommand;
  clearCommand?: ClearCommand;
  isDynamic: () => boolean;

  constructor(options: CustomPrimitiveOptions) {
    this.commandType = options.commandType;
    this.geometry = options.geometry;
    this.attributeLocations = options.attributeLocations;
    this.primitiveType = options.primitiveType;
    this.uniformMap = options.uniformMap || {};
    this.vertexShaderSource = options.vertexShaderSource;
    this.fragmentShaderSource = options.fragmentShaderSource;
    this.rawRenderState = options.rawRenderState;
    this.framebuffer = options.framebuffer;
    this.outputTexture = options.outputTexture;
    this.autoClear = options.autoClear ?? false;
    this.preExecute = options.preExecute;

    this.show = true;
    this.commandToExecute = undefined;
    this.clearCommand = undefined;
    this.isDynamic = options.isDynamic ?? (() => true);
    
    if (this.autoClear) {
      this.clearCommand = new ClearCommand({
        color: new Color(0.0, 0.0, 0.0, 0.0),
        depth: 1.0,
        framebuffer: this.framebuffer,
        pass: Pass.OPAQUE,
      });
    }
  }

  createCommand(context: any): DrawCommand | ComputeCommand {
    if (this.commandType === 'Draw') {
      const vertexArray = VertexArray.fromGeometry({
        context: context,
        geometry: this.geometry!,
        attributeLocations: this.attributeLocations,
        bufferUsage: BufferUsage.STATIC_DRAW,
      });

      const shaderProgram = ShaderProgram.fromCache({
        context: context,
        vertexShaderSource: this.vertexShaderSource!,
        fragmentShaderSource: this.fragmentShaderSource,
        attributeLocations: this.attributeLocations,
      });

      const renderState = RenderState.fromCache(this.rawRenderState);
      return new DrawCommand({
        owner: this,
        vertexArray: vertexArray,
        primitiveType: this.primitiveType!,
        modelMatrix: Matrix4.IDENTITY,
        renderState,
        shaderProgram: shaderProgram,
        framebuffer: this.framebuffer,
        uniformMap: this.uniformMap,
        pass: Pass.OPAQUE,
      });
    } else if (this.commandType === 'Compute') {
      return new ComputeCommand({
        owner: this,
        fragmentShaderSource: this.fragmentShaderSource,
        uniformMap: this.uniformMap,
        outputTexture: this.outputTexture,
        persists: true
      });
    } else {
      throw new Error('Unknown command type');
    }
  }

  setGeometry(context: any, geometry: Geometry) {
    this.geometry = geometry;
    if (defined(this.commandToExecute)) {
      this.commandToExecute.vertexArray = VertexArray.fromGeometry({
        context: context,
        geometry: this.geometry,
        attributeLocations: this.attributeLocations!,
        bufferUsage: BufferUsage.STATIC_DRAW,
      });
    }
  }

  update(frameState: any) {
    if (!this.isDynamic()) {
      return;
    }

    if (!this.show || !defined(frameState)) {
      return;
    }

    if (!defined(this.commandToExecute)) {
      this.commandToExecute = this.createCommand(frameState.context);
    }

    if (defined(this.preExecute)) {
      this.preExecute();
    }

    if (!frameState.commandList) {
      console.warn('frameState.commandList is undefined');
      return;
    }

    if (defined(this.clearCommand)) {
      frameState.commandList.push(this.clearCommand);
    }

    if (defined(this.commandToExecute)) {
      frameState.commandList.push(this.commandToExecute);
    }
  }

  isDestroyed(): boolean {
    return false;
  }

  destroy() {
    if (defined(this.commandToExecute)) {
      this.commandToExecute.shaderProgram?.destroy();
      this.commandToExecute.shaderProgram = undefined;
    }
    return destroyObject(this);
  }
}