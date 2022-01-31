import { Subject, Subscription, Observable, debounceTime } from 'rxjs';

import { Injectable } from '@angular/core';
import { MinesweeperComponent, MinesweeperLevel } from 'projects/minesweeper/src/public-api';
import { DOMRect, ToolBaseInfo, ToolData, WindowData, WindowType } from '../interface/interface';
import { RectService } from './rect.service';



@Injectable({
  providedIn: 'root'
})
export class DesktopService {

  constructor() { }

  static readonly TaskBarHeight = 40;
  static readonly WindowHeaderHeight = 24;
  static readonly ToolBaseInfoData: { [WindowType: string]: ToolBaseInfo; } = {
    [WindowType.Minesweeper]: {
      type: WindowType.Minesweeper,
      name: 'Minesweeper',
      icon: {
        default: '/assets/image/icon/desktop/minesweeper.svg',
        min: '/assets/image/icon/desktop/minesweeper-min.svg'
      }
    }
  };
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
  private updateFocus = new Subject<string>();
  updateFocus$: Observable<string> = this.updateFocus.pipe(debounceTime(10));

  private desktopResize = new Subject<{ width: number; height: number; }>();
  desktopResize$: Observable<{ width: number; height: number; }> = this.desktopResize.asObservable();

  setDOM(DOM: HTMLElement) {
    this.DOM = DOM;
  }

  getRect(): DOMRect {
    return RectService.getDomRect(this.DOM);
  }

  putUpdateFoucs(id: string): void {
    this.updateFocus.next(id);
  }

  putDesktopResize(width: number, height: number): void {
    this.desktopResize.next({
      width, height
    });
  }

  createId(): string {
    return Math.floor((1 + Math.random()) * 0x1000000000000000).toString(16);
  }



  createMinesweeper(level: MinesweeperLevel = MinesweeperLevel.Easy): WindowData {
    return {
      id: this.createId(),
      ...DesktopService.ToolBaseInfoData[WindowType.Minesweeper],
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
