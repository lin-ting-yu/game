import { Component, ElementRef, HostListener, OnInit, QueryList, ViewChildren } from '@angular/core';
import { MinesweeperComponent, MinesweeperLevel } from 'projects/minesweeper/src/public-api';
import { Observable } from 'rxjs';
import { BarItem, UpdateOpenRect, WindowData, DOMRect, BarItemClickData, SizeControlType } from './shared';
import { DesktopRectService } from './shared/service/desktop-rect.service';
import { BarItemComponent } from './task-bar/bar-item/bar-item.component';

@Component({
  selector: 'app-desktop',
  templateUrl: './desktop.component.html',
  styleUrls: ['./desktop.component.scss'],
  providers: [DesktopRectService]
})
export class DesktopComponent implements OnInit {

  constructor(
    private el: ElementRef,
    private desktopRectService: DesktopRectService
  ) { }

  @ViewChildren(BarItemComponent) barItemComponentList: QueryList<BarItemComponent>;
  @HostListener('window:resize', ['$event.target']) hostResise(event: any) {
    this.checkWindowRect();
  }

  windowList: WindowData[] = [
    {
      id: 'o23c03fmwpeofjwpeok',
      name: 'Minesweeper',
      icon: '',
      openRect: {
        width: 256,
        height: 340,
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
          level: MinesweeperLevel.Easy
        }
      }
    }
  ];

  barItemList: BarItem[] = [];

  ngOnInit(): void {
    this.barItemList = this.windowList.map(win => ({
      id: win.id,
      icon: win.icon,
      name: win.name
    }));
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
    const rect = this.desktopRectService.getRect();
    const maxHeight = rect.height - DesktopRectService.taskBarHeight;

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
    if (innerWindowRect.y + innerWindowRect.height + DesktopRectService.taskBarHeight > rect.height) {
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
  }

  private setDOM(): void {
    this.desktopRectService.setDOM((this.el.nativeElement as HTMLElement));
  }

  private checkWindowRect(): void {

  }

}
