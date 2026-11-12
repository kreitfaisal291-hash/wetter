import type {
  CSSProperties,
  ReactNode,
  RefObject,
} from "react";

export type GlassSurfaceProps = {
  children?: ReactNode;
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  borderWidth?: number;
  brightness?: number;
  opacity?: number;
  blur?: number;
  displace?: number;
  backgroundOpacity?: number;
  saturation?: number;
  distortionScale?: number;
  redOffset?: number;
  greenOffset?: number;
  blueOffset?: number;
  xChannel?: "R" | "G" | "B" | "A";
  yChannel?: "R" | "G" | "B" | "A";
  mixBlendMode?: string;
  refraction?: boolean;
  renderer?: "auto" | "webgl" | "svg";
  backdrop?: HTMLElement | RefObject<HTMLElement | null> | null;
  shape?: string;
  className?: string;
  style?: CSSProperties;
};

declare function GlassSurface(props: GlassSurfaceProps): ReactNode;

export default GlassSurface;
