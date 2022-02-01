import { Subject, Subscription, Observable, debounceTime } from 'rxjs';

import { Injectable } from '@angular/core';
import { MinesweeperComponent, MinesweeperLevel } from 'projects/minesweeper/src/public-api';
import { DOMRect, ToolBaseInfo, ToolData, WindowData, WindowType } from '../interface/interface';
import { RectService } from './rect.service';
import { environment } from 'src/environments/environment';
import { IframeContentComponent } from 'projects/iframe-content/src/public-api';



@Injectable({
  providedIn: 'root'
})
export class DesktopService {

  constructor() { }

  static readonly TaskBarHeight = 40 - 1 ;
  static readonly WindowHeaderHeight = 24;
  static readonly ToolBaseInfoData: { [WindowType: string]: ToolBaseInfo; } = {
    [WindowType.Minesweeper]: {
      type: WindowType.Minesweeper,
      name: 'Minesweeper',
      icon: {
        default: `${environment.assetsPath}/image/icon/desktop/minesweeper.svg`,
        min: `${environment.assetsPath}/image/icon/desktop/minesweeper-min.svg`
      }
    },
    [WindowType.Div100]: {
      type: WindowType.Div100,
      name: '100 DIV',
      icon: {
        default: `${environment.assetsPath}/image/icon/desktop/100div.svg`,
        min: `${environment.assetsPath}/image/icon/desktop/100div-min.svg`
      }
    },
    [WindowType.GitHub]: {
      type: WindowType.GitHub,
      name: 'GitHub',
      icon: {
        default: `${environment.assetsPath}/image/icon/desktop/github.svg`,
        min: `${environment.assetsPath}/image/icon/desktop/github.svg`
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
    return RectService.getDOMRect(this.DOM);
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
      isDisabledCollapse: false,
      isDisabledZoom: true,
      isDisabledClose: false,
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

  create100Div(): WindowData {
    return {
      id: this.createId(),
      ...DesktopService.ToolBaseInfoData[WindowType.Div100],
      openRect: {
        width: 600,
        height: 400,
        x: 100,
        y: 100,
      },
      closeRect: {
        width: 0,
        height: 0,
        x: 0,
        y: 0,
      },
      minWidth: 600,
      minHeight: 400,
      isWidthFull: false,
      isHeightFull: false,
      isCollapse: false,
      isFocus: true,
      isDisabledSelect: true,
      isDisabledCollapse: false,
      isDisabledZoom: false,
      isDisabledClose: false,
      isDisabledControlSize: false,
      content: {
        component: IframeContentComponent,
        inputs: {
          src: 'http://localhost:8848/index.html'
        }
      }
    };
  }




}
