import { Observable } from "rxjs";


export interface DOMRect {
  width: number;
  height: number;
  x: number;
  y: number;
}

export interface WindowData {
  id: string;
  name: string;
  openRect: DOMRect;
  closeRect: DOMRect;
  isWidthFull: boolean;
  isHeightFull: boolean;
  zIndex: number;
  isCollapse: boolean;
  isFocus: boolean;
  isAutoSize: boolean;
}

export interface BarItem {
  id: string;
  icon?: string;
  name: string;
}

export interface BarItemClickData {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export enum SizeControlType {
  Top = 'top',
  Left = 'left',
  Bottom = 'bottom',
  Right = 'right',
  TopLeft = 'topLeft',
  BottomLeft = 'bottomLeft',
  BottomRight = 'bottomRight',
  TopRight = 'topRight',
}

export interface UpdateOpenRect {
  type: 'move' | 'resize';
  rect: DOMRect;
}
