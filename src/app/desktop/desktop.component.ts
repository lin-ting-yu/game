import { environment } from './../../environments/environment.prod';
import { Component, ElementRef, HostListener, OnInit, QueryList, ViewChildren } from '@angular/core';
import { MinesweeperComponent, MinesweeperLevel } from 'projects/minesweeper/src/public-api';
import { BarItem, UpdateOpenRect, WindowData, DOMRect, BarItemClickData, SizeControlType, WindowType, ToolData } from './shared/interface/interface';
import { DesktopService } from './shared/service';
import { BarItemComponent } from './task-bar/bar-item/bar-item.component';

@Component({
  selector: 'app-desktop',
  templateUrl: './desktop.component.html',
  styleUrls: ['./desktop.component.scss'],
  providers: [DesktopService]
})
export class DesktopComponent implements OnInit {

  constructor(
    private el: ElementRef,
    private desktopService: DesktopService
  ) { }

  @ViewChildren(BarItemComponent) barItemComponentList: QueryList<BarItemComponent>;
  @HostListener('window:resize', ['$event.target']) hostResise(event: any) {
    // TODO:
  }
  @HostListener('contextmenu') contextmenu(): boolean {
    return this.production;
  }

  readonly production = environment.production;
  readonly WindowType = WindowType;
  readonly ToolData = DesktopService.ToolData;

  readonly toolList: ToolData[] = [];

  windowList: WindowData[] = [];
  barItemList: BarItem[] = [];

  // isBlur = false;


  ngOnInit(): void {
    'aasqbcdgefghijkvkqlmdnopgrystukvwexcyz'.toLocaleUpperCase().split('').forEach(en => {
      this.toolList.push({
        type: WindowType.Minesweeper,
        name: `${en.repeat(~~(Math.random() * 10) + 1)}-${~~(Math.random() * 100000)}`,
        icon: {
          default: '/assets/image/icon/desktop/minesweeper.svg',
          min: '/assets/image/icon/desktop/minesweeper-min.svg'
        },
        onClick: () => { }
      })
    })
  }
  ngAfterViewInit(): void {
    this.setDOM();
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

    windowData.isWidthFull = false;
    windowData.isHeightFull = false;

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
    const lastIndex = this.windowList.length - 1;
    if (this.windowList[lastIndex].id === id && check) {
      this.windowList[lastIndex].isFocus = true;
      return;
    }
    const index = this.windowList.findIndex(item => item.id === id);
    this.windowList.forEach(item => { item.isFocus = false; });
    this.windowList[index].isFocus = true;
    const windowData = this.windowList.splice(index, 1);
    this.windowList.push(windowData[0]);
  }

  allWindowBlur(): void {
    this.windowList.forEach(item => item.isFocus = false);
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
    setTimeout(() => {
      minesweeper.isCollapse = false;
      this.toTop(minesweeper.id, false);
    }, 0);
  }


  private setDOM(): void {
    this.desktopService.setDOM((this.el.nativeElement as HTMLElement));
  }

}
