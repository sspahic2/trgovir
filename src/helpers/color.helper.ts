export const ColorHelper = {
  getStrokeColorByTheme: (): string => {
    if (typeof window === "undefined") return "black"; // SSR fallback
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "white" : "black";
  },
  determineColor: (strokeColor: string): string => {
    if(strokeColor == "theme") return ColorHelper.getStrokeColorByTheme();

    return strokeColor;
  }
}