import { environment } from './../../environments/environment';
import { ChangeDetectionStrategy, Component, ElementRef, HostListener, OnInit, QueryList, ViewChildren, ChangeDetectorRef } from '@angular/core';
import { MinesweeperComponent, MinesweeperLevel } from 'projects/minesweeper/src/public-api';
import { BarItem, UpdateOpenRect, WindowData, DOMRect, BarItemClickData, SizeControlType, WindowType, ToolData } from 'projects/data/src/lib/interface';
import { DesktopService, RectService } from 'projects/data/src/lib/service';
import { BarItemComponent } from './task-bar/bar-item/bar-item.component';

@Component({
  selector: 'app-desktop',
  templateUrl: './desktop.component.html',
  styleUrls: ['./desktop.component.scss'],
  providers: [
    RectService,
    DesktopService
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DesktopComponent implements OnInit {

  constructor(
    private el: ElementRef,
    private desktopService: DesktopService,
    private cdRef: ChangeDetectorRef
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
  @HostListener('contextmenu') contextmenu(): boolean {
    return !this.production;
  }

  private oldWidth: number;
  private oldHeight: number;
  readonly production = environment.production;
  readonly assetsPath = environment.assetsPath;
  readonly WindowType = WindowType;
  readonly ToolBaseInfoData = DesktopService.ToolBaseInfoData;

  readonly zIndexMapping: { [id: string]: number; } = { };
  readonly toolList: ToolData[] = [
    {
      ...DesktopService.ToolBaseInfoData[WindowType.Minesweeper],
      onClick: (rect: DOMRect) => { this.createMinesweeper(rect); }
    },
    {
      ...DesktopService.ToolBaseInfoData[WindowType.Div100],
      onClick: (rect: DOMRect) => { this.create100Div(rect); }
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
          default: `${this.assetsPath}/image/icon/desktop/minesweeper.svg`,
          min: `${this.assetsPath}/image/icon/desktop/minesweeper-min.svg`
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

    if (windowData.isWidthFull && windowData.isHeightFull) {
      console.log(updateOpenRect.mouseEvent.x);

      if (
        updateOpenRect.mouseEvent.x <= innerWindowRect.width ||
        updateOpenRect.mouseEvent.x >= innerWindowRect.width + innerWindowRect.x - 80
      ) {
        innerWindowRect.x = updateOpenRect.mouseEvent.x - innerWindowRect.width / 2;
      }
      innerWindowRect.y = 0;
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

  createMinesweeper(rect: DOMRect): void {
    const minesweeper = this.desktopService.createMinesweeper();
    const parentRect = this.desktopService.getRect();
    minesweeper.isCollapse = true;
    minesweeper.closeRect = rect;
    minesweeper.openRect.x = (parentRect.width - minesweeper.openRect.width) / 2;
    minesweeper.openRect.y = (parentRect.height - minesweeper.openRect.height) / 2;
    this.windowList.push(minesweeper);
    this.barItemList.push({
      id: minesweeper.id,
      icon: minesweeper.icon.min,
      name: minesweeper.name
    });
    this.zIndexMapping[minesweeper.id] = this.windowList.length;
    setTimeout(() => {
      minesweeper.isCollapse = false;
      this.toTop(minesweeper.id, false);
      this.cdRef.markForCheck();
    }, 0);
  }

  create100Div(rect: DOMRect): void {
    const div100 = this.desktopService.create100Div();
    const parentRect = this.desktopService.getRect();
    div100.isCollapse = true;
    div100.closeRect = rect;
    div100.openRect.x = (parentRect.width - div100.openRect.width) / 2;
    div100.openRect.y = (parentRect.height - div100.openRect.height) / 2;
    this.windowList.push(div100);
    this.barItemList.push({
      id: div100.id,
      icon: div100.icon.min,
      name: div100.name
    });
    this.zIndexMapping[div100.id] = this.windowList.length;
    setTimeout(() => {
      div100.isCollapse = false;
      this.toTop(div100.id, false);
      this.cdRef.markForCheck();
    }, 0);
  }

  private updateZIndex(targetIndex: number): void {
    const idList = Object.keys(this.zIndexMapping);
    idList.forEach(id => {
      if (this.zIndexMapping[id] === targetIndex) {
        this.zIndexMapping[id]  = idList.length;
      } else if (this.zIndexMapping[id] > targetIndex) {
        this.zIndexMapping[id] --;
      }
    })
  }

  private setDOM(): void {
    this.desktopService.setDOM((this.el.nativeElement as HTMLElement));
  }

}
