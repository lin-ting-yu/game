
import { Injectable } from '@angular/core';
import { MinesweeperComponent, MinesweeperLevel } from 'projects/minesweeper/src/public-api';
import { DOMRect, ToolBaseInfo, WindowData, WindowType } from '../interface/interface';



@Injectable({
  providedIn: 'root'
})
export class DesktopService {

  constructor() { }

  static readonly TaskBarHeight = 40;
  static readonly WindowHeaderHeight = 24;
  static readonly ToolData: { [WindowType: string]: ToolBaseInfo } = {
    [WindowType.Minesweeper]: {
      type: WindowType.Minesweeper,
      name: 'Minesweeper',
      icon: {
        default: '/assets/image/icon/desktop/minesweeper.svg',
        min: '/assets/image/icon/desktop/minesweeper-min.svg'
      }
    }
  }
  static readonly MinesweeperSize = {
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

  private DOM: HTMLElement;

  setDOM(DOM: HTMLElement) {
    this.DOM = DOM;
  }

  getRect(): DOMRect {
    const rect = this.DOM.getBoundingClientRect();
    return {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
    };
  }

  createId(): string {
    return Math.floor((1 + Math.random()) * 0x1000000000000000).toString(16);
  }



  createMinesweeper(level: MinesweeperLevel = MinesweeperLevel.Easy): WindowData {
    return {
      id: this.createId(),
      ...DesktopService.ToolData[WindowType.Minesweeper],
      openRect: {
        ...DesktopService.MinesweeperSize[level],
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
      isCollapse: false,
      isFocus: true,
      isDisabledSelect: false,
      isDisabledCollapse: true,
      isDisabledZoom: false,
      isDisabledClose: true,
      isDisabledControlSize: true,
      content: {
        component: MinesweeperComponent,
        inputs: {
          level
        }
      },
      select: {
        options: [
          {
            value: MinesweeperLevel.Easy,
            text: MinesweeperLevel.Easy
          },
          {
            value: MinesweeperLevel.Normal,
            text: MinesweeperLevel.Normal
          },
          {
            value: MinesweeperLevel.Hard,
            text: MinesweeperLevel.Hard
          },
        ],
        value: level
      }
    };
  }




}
