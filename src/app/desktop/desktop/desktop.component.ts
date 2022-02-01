import { RightMenuComponent } from './../right-menu/right-menu.component';
import { environment } from './../../../environments/environment';
import { ChangeDetectionStrategy, Component, ElementRef, HostListener, OnInit, QueryList, ViewChildren, ChangeDetectorRef } from '@angular/core';
import { MinesweeperComponent, MinesweeperLevel } from 'projects/minesweeper/src/public-api';
import { BarItem, UpdateOpenRect, WindowData, DOMRect, BarItemClickData, SizeControlType, WindowType, ToolData, DesktopItemContextmenu } from 'projects/data/src/lib/interface';
import { DesktopService, RectService } from 'projects/data/src/lib/service';
import { BarItemComponent } from './../task-bar/bar-item/bar-item.component';
import { OverlayService } from '../shared/service/overlay.service';
import * as createjs from 'createjs-module';
import { GreetService } from '../shared/service/greet.service';

@Component({
  selector: 'app-desktop',
  templateUrl: './desktop.component.html',
  styleUrls: ['./desktop.component.scss'],
  providers: [
    OverlayService,
    RectService,
    DesktopService,
    GreetService
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DesktopComponent implements OnInit {

  constructor(
    private el: ElementRef,
    private cdRef: ChangeDetectorRef,
    private greetService: GreetService,
    private desktopService: DesktopService,
    private overlayService: OverlayService,
  ) {
    RectService.parentTagName = 'APP-DESKTOP';
  }

  @ViewChildren(BarItemComponent) barItemComponentList: QueryList<BarItemComponent>;
  @HostListener('window:resize', ['$event.target']) hostResise(event: any) {
    const rect = this.desktopService.getRect();
    if (this.oldWidth !== rect.width || this.oldHeight !== rect.height) {
      this.oldWidth = rect.width;
      this.oldHeight = rect.height;
      this.desktopService.putDesktopResize(rect.width, rect.height);
    }
  }
  @HostListener('document.body.contextmenu') contextmenu(): boolean {
    return !this.production;
  }

  private oldWidth: number;
  private oldHeight: number;
  readonly production = environment.production;
  readonly assetsPath = environment.assetsPath;
  readonly WindowType = WindowType;
  readonly ToolBaseInfoData = DesktopService.ToolBaseInfoData;

  readonly zIndexMapping: { [id: string]: number; } = {};
  readonly toolList: ToolData[] = [
    {
      ...DesktopService.ToolBaseInfoData[WindowType.Minesweeper],
      onClick: (rect: DOMRect) => { this.createMinesweeper(rect); }
    },
    {
      ...DesktopService.ToolBaseInfoData[WindowType.Div100],
      onClick: (rect: DOMRect) => { this.create100Div(rect); }
    },
    {
      ...DesktopService.ToolBaseInfoData[WindowType.GitHub],
      onClick: (rect: DOMRect) => {
        window.open('https://github.com/lin-ting-yu/game');
      }
    },
  ];

  readonly desktopItemList = [
    {
      toolBaseInfo: this.ToolBaseInfoData[WindowType.GitHub],
      onDblclick: (rect: DOMRect) => {
        window.open('https://github.com/lin-ting-yu/game');
      },
      rightClick: (rect: DesktopItemContextmenu) =>
        this.rightClick(rect, 'https://github.com/lin-ting-yu/game')
    },
    {
      toolBaseInfo: this.ToolBaseInfoData[WindowType.Minesweeper],
      onDblclick: (rect: DOMRect) => this.createMinesweeper(rect),
      rightClick: (rect: DesktopItemContextmenu) =>
        this.rightClick(rect, 'https://github.com/lin-ting-yu/minesweeper', (rect) => this.createMinesweeper(rect))
    },
    {
      toolBaseInfo: this.ToolBaseInfoData[WindowType.Div100],
      onDblclick: (rect: DOMRect) => this.create100Div(rect),
      rightClick: (rect: DesktopItemContextmenu) =>
        this.rightClick(rect, 'https://github.com/lin-ting-yu/100div', (rect) => this.create100Div(rect))
    }
  ];

  windowList: WindowData[] = [];
  barItemList: BarItem[] = [];

  // isBlur = false;


  ngOnInit(): void {
    'aasqbcdgefghijkvkqlmdnopgrystukvwexc'.toLocaleUpperCase().split('').forEach(en => {
      this.toolList.push({
        type: WindowType.Minesweeper,
        name: `${en} Fake Item ${~~(Math.random() * 100000)}`,
        icon: {
          default: `${this.assetsPath}/image/icon/desktop/fake-icon.svg`,
          min: `${this.assetsPath}/image/icon/desktop/fake-icon.svg`
        },
        onClick: () => { }
      });
    });
  }
  ngAfterViewInit(): void {
    this.setDOM();
    const rect = this.desktopService.getRect();
    this.oldWidth = rect.width;
    this.oldHeight = rect.height;
  }

  collapseWindow(id: string): void {
    const barItem = this.barItemComponentList.toArray().find(cpt => cpt.id === id);
    const windowData = this.windowList.find(w => w.id === id);
    if (windowData) {
      if (barItem) {
        windowData.closeRect = barItem.getRect();
      }
      windowData.isCollapse = true;
    }
  }

  zoomWindow(windowData: WindowData): void {
    windowData.isWidthFull = !windowData.isWidthFull;
    windowData.isHeightFull = !windowData.isHeightFull;
  }

  closeWindow(id: string): void {
    const barItemIndex = this.barItemComponentList.toArray().findIndex(cpt => cpt.id === id);
    const windowIndex = this.windowList.findIndex(w => w.id === id);

    if (barItemIndex > -1) {
      this.barItemList.splice(barItemIndex, 1);
    }
    if (windowIndex > -1) {
      this.windowList.splice(windowIndex, 1);
    }
  }

  updateOpenRect(windowData: WindowData, updateOpenRect: UpdateOpenRect): void {
    const innerWindowRect = { ...updateOpenRect.rect };
    const rect = this.desktopService.getRect();
    const maxHeight = rect.height - DesktopService.TaskBarHeight;

    // 全螢幕模式
    if (windowData.isWidthFull && windowData.isHeightFull) {
      if (updateOpenRect.type === 'move') {
        if (
          updateOpenRect.mouseEvent.x <= innerWindowRect.width ||
          updateOpenRect.mouseEvent.x >= innerWindowRect.width + innerWindowRect.x - 80
        ) {
          innerWindowRect.x = updateOpenRect.mouseEvent.x - innerWindowRect.width / 2;
        }
        innerWindowRect.y = 0;
      } else {

      }
    }

    // 判斷左出界
    if (innerWindowRect.x < 0) {
      if (updateOpenRect.type === 'resize') {
        innerWindowRect.width += innerWindowRect.x;
      }
      innerWindowRect.x = 0;
    }
    // 判斷右出界
    if (innerWindowRect.x + innerWindowRect.width > rect.width) {
      if (updateOpenRect.type === 'resize') {
        innerWindowRect.width = rect.width - innerWindowRect.x;
        innerWindowRect.width = Math.min(rect.width, innerWindowRect.width);

      } else {
        innerWindowRect.x = rect.width - innerWindowRect.width;
      }
    }
    // 檢查最小寬
    if (innerWindowRect.width < windowData.minWidth) {
      if (
        updateOpenRect.sizeControlType === SizeControlType.Left ||
        updateOpenRect.sizeControlType === SizeControlType.TopLeft ||
        updateOpenRect.sizeControlType === SizeControlType.BottomLeft
      ) {
        let diff = innerWindowRect.width - windowData.minWidth;
        innerWindowRect.x += diff;
      }
      innerWindowRect.width = windowData.minWidth;
    }

    // 判斷下出界
    if (innerWindowRect.y + innerWindowRect.height + DesktopService.TaskBarHeight > rect.height) {
      if (updateOpenRect.type === 'resize') {
        innerWindowRect.height = maxHeight - innerWindowRect.y;
      } else {
        innerWindowRect.y = maxHeight - innerWindowRect.height;
      }
    }

    // 判斷上出界
    if (innerWindowRect.y < 0) {
      if (updateOpenRect.type === 'resize') {
        innerWindowRect.height += innerWindowRect.y;
        innerWindowRect.height = Math.min(maxHeight, innerWindowRect.height);
      }
      innerWindowRect.y = 0;
    }

    // 檢查最小高
    if (innerWindowRect.height < windowData.minHeight) {
      if (
        updateOpenRect.sizeControlType === SizeControlType.Top ||
        updateOpenRect.sizeControlType === SizeControlType.TopLeft ||
        updateOpenRect.sizeControlType === SizeControlType.TopRight
      ) {
        let diff = innerWindowRect.height - windowData.minHeight;
        innerWindowRect.y += diff;
      }
      innerWindowRect.height = windowData.minHeight;
    }
    windowData.isWidthFull = false;
    windowData.isHeightFull = false;
    windowData.openRect = innerWindowRect;
    this.toTop(windowData.id);
  }

  updateSelect(windowData: WindowData, value: string): void {
    if (windowData.type === WindowType.Minesweeper) {
      const innerValue = value as MinesweeperLevel;
      if (windowData.content) {
        windowData.content = {
          component: MinesweeperComponent,
          inputs: {
            level: value
          }
        };
        windowData.openRect = {
          ...windowData.openRect,
          ...DesktopService.MinesweeperSize[innerValue]
        };
      }

    }
  }

  itemClick(event: BarItemClickData): void {
    const windowData = this.windowList.find(w => w.id === event.id);
    if (windowData) {
      windowData.closeRect = {
        x: event.x,
        y: event.y,
        width: event.width,
        height: event.height,
      };

      windowData.isCollapse = false;
      this.toTop(windowData.id);
    }
  }

  toTop(id: string, check = true): void {
    this.updateZIndex(this.zIndexMapping[id]);
    this.windowList.forEach(item => {
      if (item.id !== id) {
        item.isFocus = false;
      } else {
        item.isFocus = true;
      }
    });
    this.cdRef.detectChanges();
    this.desktopService.putUpdateFoucs(id);
  }

  allWindowBlur(): void {
    this.windowList.forEach(item => item.isFocus = false);
    this.desktopService.putUpdateFoucs('');
  }

  windowToCenter(event: BarItemClickData): void {
    const desktopRect = this.desktopService.getRect();
    const windowData = this.windowList.find(windowData => windowData.id === event.id);
    if (windowData) {
      const rect = { ...windowData.openRect };
      const centerData = {
        x: (desktopRect.width - (rect?.width || 0)) / 2,
        y: (desktopRect.height - (rect?.height || 0)) / 2,
        width: rect?.width,
        height: rect?.height,
      };
      if (windowData.isCollapse) {
        windowData.openRect = centerData;
        windowData.isCollapse = false;
        this.toTop(event.id, false);
        this.cdRef.markForCheck();
      } else {
        this.toTop(event.id, false);
        createjs.Tween
          .get(rect)
          .to(centerData, 200, createjs.Ease.cubicOut)
          .addEventListener('change', (e) => {
            windowData.openRect = {
              x: rect.x,
              y: rect.y,
              width: rect.width,
              height: rect.height,
            };
            this.cdRef.markForCheck();
          });
      }
    }
  }

  private createWindowConponent(rect: DOMRect, windowData: WindowData): void {
    const parentRect = this.desktopService.getRect();
    windowData.isCollapse = true;
    windowData.closeRect = rect;
    windowData.openRect.x = (parentRect.width - windowData.openRect.width) / 2;
    windowData.openRect.y = (parentRect.height - windowData.openRect.height) / 2;
    this.windowList.push(windowData);
    this.barItemList.push({
      id: windowData.id,
      icon: windowData.icon.min,
      name: windowData.name
    });
    this.zIndexMapping[windowData.id] = this.windowList.length;
    setTimeout(() => {
      windowData.isCollapse = false;
      this.toTop(windowData.id, false);
      this.cdRef.markForCheck();
    }, 0);
  }
  private createMinesweeper(rect: DOMRect): void {
    this.createWindowConponent(
      rect,
      this.desktopService.createMinesweeper()
    );
  }

  private create100Div(rect: DOMRect): void {
    this.createWindowConponent(
      rect,
      this.desktopService.create100Div()
    );
  }

  private rightClick(
    event: DesktopItemContextmenu,
    githubUrl: string,
    openFn?: (rect: DOMRect) => void
  ): void {
    const overlay = this.overlayService.openOverlay<RightMenuComponent>(
      { x: event.mouseEvent.pageX, y: event.mouseEvent.pageY },
      RightMenuComponent,
      {
        rightItemList: [
          {
            icon: `${this.assetsPath}/image/icon/right-tool/open.svg`,
            name: 'Open',
            isDisabled: !openFn,
            onClick: () => {
              if (openFn) {
                openFn(event.rect);
                this.cdRef.markForCheck();
              }
            }
          },
          {
            icon: `${this.assetsPath}/image/icon/right-tool/github.svg`,
            name: 'Github',
            onClick: () => {
              window.open(githubUrl);
            }
          },
          {
            icon: `${this.assetsPath}/image/icon/right-tool/heart.svg`,
            name: 'Say Hi',
            onClick: () => {
              this.greetService.greet(event.rect.x, event.rect.y);
            }
          },
        ],
      }
    );
    overlay.componentRef.instance.putClose.subscribe(() => {
      overlay.destroy();
    });
  }

  private updateZIndex(targetIndex: number): void {
    const idList = Object.keys(this.zIndexMapping);
    idList.forEach(id => {
      if (this.zIndexMapping[id] === targetIndex) {
        this.zIndexMapping[id] = idList.length;
      } else if (this.zIndexMapping[id] > targetIndex) {
        this.zIndexMapping[id]--;
      }
    });
  }

  private setDOM(): void {
    this.desktopService.setDOM((this.el.nativeElement as HTMLElement));
  }

}
