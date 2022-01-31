import { Component, ContentChildren, Input, OnDestroy, OnInit, QueryList, ViewChild, ViewContainerRef, ElementRef, ChangeDetectorRef, ViewChildren } from '@angular/core';
import { ToolData } from '../shared/interface';
import * as dayjs from 'dayjs';
import { BarItemComponent } from './bar-item/bar-item.component';
import { DesktopService, RectService } from '../shared/service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-task-bar',
  templateUrl: './task-bar.component.html',
  styleUrls: ['./task-bar.component.scss'],
})
export class TaskBarComponent implements OnInit, OnDestroy {

  constructor(
    private desktopService: DesktopService,
    private cdRef: ChangeDetectorRef
  ) { }

  @ContentChildren(BarItemComponent) BarItemComponentList: QueryList<BarItemComponent>;
  @ViewChildren('barItemDOM') barItemDOMList: QueryList<ElementRef>;
  @ViewChild('itemContainer') itemContainer: ElementRef;
  @ViewChild('more') more: ElementRef;
  @Input() readonly toolList: ToolData[];


  private resize$: Subscription;
  private updateFocus$: Subscription;
  private barItemChange$: Subscription;

  barItemList: any[] = [];

  hour = '';
  minute = '';
  today = '';

  isOpenToolList = false;

  maxItemLength: number;
  moreLength: number;
  isOver = false;
  isShowMore = false;
  isFocusInMore = false;

  private interval: NodeJS.Timer;
  private moreTimeout: NodeJS.Timer;

  get moreContainerHeight(): string {
    return `${Math.min(this.moreLength * 40 + 4, 220)}px`;
  }

  ngOnInit(): void {
    this.resize$ = this.desktopService.desktopResize$.subscribe(() => {

      this.updateMaxItemLength();
      this.setBarItemList();
      this.cdRef.markForCheck();
    });
    this.updateFocus$ = this.desktopService.updateFocus$.subscribe(() => {
      this.isFocusInMore = false;
      this.setBarItemList();
      this.cdRef.markForCheck();
    });

    this.setTime();
    this.interval = setInterval(() => {
      this.setTime();
    }, 1000);
  }

  ngAfterViewInit(): void {
    this.updateMaxItemLength();
    this.barItemChange$ = this.BarItemComponentList.changes.subscribe((e) => {
      this.setBarItemList();
    });
  }

  ngOnDestroy(): void {
    this.barItemChange$?.unsubscribe();
    this.updateFocus$?.unsubscribe();
    this.resize$?.unsubscribe();
    clearInterval(this.interval);
  }

  itemClick(itemDOM: HTMLElement, index: number, id: string): void {
    const rect = RectService.getDomRect(itemDOM);

    const barItem = this.BarItemComponentList.toArray()[index];
    barItem.onItemClick.emit({
      id,
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
    });
  }

  private setBarItemList(): void {
    if (!this.BarItemComponentList) {
      return;
    }
    const cptList = this.BarItemComponentList.toArray();
    this.isOver = cptList.length > this.maxItemLength;
    this.moreLength = cptList.length - this.maxItemLength;
    this.barItemList = cptList.map((item, i) => {
      if (i >= this.maxItemLength) {
        this.isFocusInMore = this.isFocusInMore || item.isFocus;
        item.getRect = () => {
          if (!this.more) {
            return { x: 0, y: 0, width: 0, height: 0 };
          }

          const rect = RectService.getDomRect(this.more.nativeElement);
          return {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
          };
        };
      } else {
        item.getRect = () => {
          if (!this.barItemDOMList) {
            return { x: 0, y: 0, width: 0, height: 0 };
          }
          const barItem = this.barItemDOMList.toArray()[i].nativeElement as HTMLElement;
          const rect = RectService.getDomRect(barItem);
          return {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
          };
        };
      }
      return {
        id: item.id,
        icon: item.icon,
        name: item.name,
        isFocus: item.isFocus
      };
    });
  }

  moreClick(): void {
    this.isShowMore = !this.isShowMore;
    clearTimeout(this.moreTimeout);
  }
  moreEnter(): void {
    clearTimeout(this.moreTimeout);
  }
  moreLeave(): void {
    clearTimeout(this.moreTimeout);
    this.moreTimeout = setTimeout(() => {
      this.isShowMore = false;
      this.cdRef.markForCheck();
    }, 2000);
  }

  private updateMaxItemLength(): void {
    const itemContainerDOM = (this.itemContainer.nativeElement as HTMLElement);
    this.maxItemLength = ~~(itemContainerDOM.offsetWidth / 160);
  }


  private setTime(): void {
    const day = dayjs();
    this.hour = day.format('A hh');
    this.minute = day.format('mm');
    this.today = day.format('YYYY/MM/DD');
  }


}
