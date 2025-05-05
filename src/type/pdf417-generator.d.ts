declare module 'pdf417-generator' {
  interface DrawOptions {
    scale?: number;
    ratio?: number;
  }

  const PDF417: {
    draw: (
      data: string,
      canvas: HTMLCanvasElement,
      scale?: number,
      ratio?: number
    ) => void;
  };

  export default PDF417;
}
