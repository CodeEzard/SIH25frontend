declare module "qrcode.react" {
  import * as React from "react";
  export interface QRCodeProps {
    value: string;
    size?: number;
    bgColor?: string;
    fgColor?: string;
    level?: "L" | "M" | "Q" | "H";
    includeMargin?: boolean;
    imageSettings?: any;
    style?: React.CSSProperties;
    className?: string;
  }
  export const QRCodeCanvas: React.FC<QRCodeProps>;
  export const QRCodeSVG: React.FC<QRCodeProps>;
  const _default: React.FC<QRCodeProps>;
  export default _default;
}
