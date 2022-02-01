import { ChangeDetectorRef, Type } from "@angular/core";
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
  };
}
export enum WindowType {
  Minesweeper = 'minesweeper',
  Div100 = 'div100',
}

export interface ToolBaseInfo {
  type: WindowType;
  name: string;
  icon: {
    default: string;
    min?: string;
  };
}

export interface WindowData extends ToolBaseInfo {
  id: string;
  openRect: DOMRect;
  closeRect: DOMRect;
  isWidthFull: boolean;
  isHeightFull: boolean;
  minWidth: number;
  minHeight: number;
  isFocus: boolean;
  isCollapse: boolean;
  isDisabledSelect: boolean;
  isDisabledCollapse: boolean;
  isDisabledZoom: boolean;
  isDisabledClose: boolean;
  isDisabledControlSize: boolean;
  select?: {
    options: { value: string; text: string; }[];
    value: string;
  };
  content?: ContentData;
}

export interface WindowInnerComponent {
  [key: string]: any;
  isFocus?: boolean;
  isCollapse?: boolean;
  isMoving?: boolean;
  isResizing?: boolean;
  windowUpdateInput?: () => void;
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
  mouseEvent: MouseEvent
}

export interface ToolData extends ToolBaseInfo {
  onClick: (rect: DOMRect) => void;
}
