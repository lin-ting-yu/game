
import { Injectable } from '@angular/core';
import { MinesweeperComponent, MinesweeperLevel } from 'projects/minesweeper/src/public-api';
import { DOMRect, WindowData } from '..';

const MinesweeperSize = {
  [MinesweeperLevel.Easy]: {
    width: 256,
    height: 340,
  },
  [MinesweeperLevel.Normal]: {
    width: 424,
    height: 506,
  },
  [MinesweeperLevel.Hard]: {
    width: 760,
    height: 506,
  }
};

@Injectable({
  providedIn: 'root'
})
export class DesktopRectService {

  constructor() { }

  static readonly taskBarHeight = 40;
  static readonly windowHeaderHeight = 24;
  private DOM: HTMLElement;

  getRect(): DOMRect {
    const rect = this.DOM.getBoundingClientRect();
    return {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
    };
  }

  setDOM(DOM: HTMLElement) {
    this.DOM = DOM;
  }

  createMinesweeper(level: MinesweeperLevel = MinesweeperLevel.Easy): WindowData {
    return {
      id: this.createId(),
      name: 'Minesweeper',
      icon: '',
      openRect: {
        ...MinesweeperSize[level],
        x: 100,
        y: 100,
      },
      closeRect: {
        width: 0,
        height: 0,
        x: 0,
        y: 0,
      },
      minWidth: 200,
      minHeight: 200,
      isWidthFull: false,
      isHeightFull: false,
      zIndex: 0,
      isCollapse: false,
      isFocus: true,
      isShowSelect: false,
      isCollapseDisabled: true,
      isZoomDisabled: false,
      isCloseDisabled: true,
      isCanControlSize: false,
      content: {
        component: MinesweeperComponent,
        inputs: {
          level
        }
      }
    };
  }


  createId(): string {
    return Math.floor((1 + Math.random()) * 0x1000000000000000).toString(16);
  }

}
