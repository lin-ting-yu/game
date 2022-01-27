import { Component, ElementRef, HostListener, OnInit, QueryList, ViewChildren } from '@angular/core';
import { Observable } from 'rxjs';
import { BarItem, UpdateOpenRect, WindowData, DOMRect, BarItemClickData } from './shared';
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
      name: 'sssasxasx',
      openRect: {
        width: 200,
        height: 300,
        x: 300,
        y: 300,
      },
      closeRect: {
        width: 200,
        height: 300,
        x: 300,
        y: 300,
      },
      isWidthFull: false,
      isHeightFull: false,
      zIndex: 0,
      isCollapse: false,
      isFocus: true,
      isAutoSize: false,
    }
  ];

  barItemList: BarItem[] = [
    {
      id: 'o23c03fmwpeofjwpeok',
      icon: '',
      name: 'sssasxasx'
    }
  ];

  ngOnInit(): void {
  }
  ngAfterViewInit(): void {
    this.setDOM();
  }

  collapseClick(id: string): void {
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

  updateOpenRect(windowData: WindowData, updateOpenRect: UpdateOpenRect): void {
    const innerWindowRect = { ...updateOpenRect.rect };
    const rect = this.desktopRectService.getRect();
    const maxHeight = rect.height - DesktopRectService.taskBarHeight;
    if (innerWindowRect.x < 0) {
      if (updateOpenRect.type === 'resize') {
        innerWindowRect.width += innerWindowRect.x;
      }
      innerWindowRect.x = 0;
    }
    if (innerWindowRect.x + innerWindowRect.width > rect.width) {
      if (updateOpenRect.type === 'resize') {
        innerWindowRect.width = rect.width - innerWindowRect.x;
      } else {
        innerWindowRect.x = rect.width - innerWindowRect.width;
      }
    }

    innerWindowRect.width = Math.min(rect.width, innerWindowRect.width);

    if (innerWindowRect.y + innerWindowRect.height + DesktopRectService.taskBarHeight > rect.height) {
      if (updateOpenRect.type === 'resize') {
        innerWindowRect.height = maxHeight - innerWindowRect.y;
      } else {
        innerWindowRect.y = maxHeight - innerWindowRect.height;
      }
    }

    if (innerWindowRect.y < 0) {
      if (updateOpenRect.type === 'resize') {
        innerWindowRect.height += innerWindowRect.y;
      }
      innerWindowRect.y = 0;
    }

    innerWindowRect.height = Math.min(maxHeight, innerWindowRect.height);

    windowData.openRect = innerWindowRect;
  }

  private setDOM(): void {
    this.desktopRectService.setDOM((this.el.nativeElement as HTMLElement));
  }

  private checkWindowRect(): void {

  }

}
