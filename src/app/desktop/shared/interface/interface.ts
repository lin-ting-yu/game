import { Type } from "@angular/core";
import { Observable } from "rxjs";


export interface DOMRect {
  width: number;
  height: number;
  x: number;
  y: number;
}
export interface ContentData {
  component: Type<unknown>;
  inputs?: {
    [key: string]: any;
  }
}
export interface WindowData {
  id: string;
  name: string;
  icon: string
  openRect: DOMRect;
  closeRect: DOMRect;
  isWidthFull: boolean;
  isHeightFull: boolean;
  minWidth: number;
  minHeight: number;
  zIndex: number;
  isShowSelect: boolean;
  isCollapse: boolean;
  isFocus: boolean;
  isCollapseDisabled: boolean;
  isZoomDisabled: boolean;
  isCloseDisabled: boolean;
  isCanControlSize: boolean;
  content?: ContentData
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
  sizeControlType: SizeControlType | null;
  rect: DOMRect;
}
