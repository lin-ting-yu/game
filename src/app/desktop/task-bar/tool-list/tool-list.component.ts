import { PerfectScrollbarComponent } from 'ngx-perfect-scrollbar';
import { Component, Input, OnInit, ViewChildren, QueryList, ElementRef, ViewChild, HostListener, Output, EventEmitter, HostBinding, ChangeDetectorRef } from '@angular/core';
import { showToolList } from 'projects/data/src/lib/animate';
import { ToolData } from 'projects/data/src/lib/interface';
import { RectService } from 'projects/data/src/lib/service';

@Component({
  selector: 'app-tool-list',
  templateUrl: './tool-list.component.html',
  styleUrls: ['./tool-list.component.scss'],
  animations: [showToolList]
})
export class ToolListComponent implements OnInit {

  constructor(
    private cdRef: ChangeDetectorRef
  ) { }

  @ViewChildren('toolGroup') toolGroupEleList: QueryList<ElementRef>;
  @ViewChildren('dot') dotList: QueryList<ElementRef>;
  @ViewChild('dotScrollContainer') dotScrollContainer: PerfectScrollbarComponent;
  @ViewChild('toolScrollContainer') toolScrollContainer: PerfectScrollbarComponent;

  @Input() readonly toolList: ToolData[];
  @Output() putClose = new EventEmitter();

  @HostBinding('@showToolList')
  @HostListener('@showToolList.done') animatieDone() {
    this.isShown = true;
    this.dotScrollContainer.directiveRef?.update();
    this.toolScrollContainer.directiveRef?.update();
  }
  @HostListener('window:click') windowClick() {
    if (!this.isShown) {
      return;
    }
    this.putClose.emit();
  }
  @HostListener('click', ['$event']) hostClick(event: MouseEvent) {
    event.stopPropagation();
  }

  private isScrollToing = false;
  isShown = false;
  innerToolList: ToolData[];
  toolGroupList: { [key: string]: ToolData[]; } = {};
  toolGroupKeyList: string[] = [];

  focusIndexList: boolean[] = [];
  subFocusIndexList: boolean[] = [];
  subHoverIndexList: boolean[] = [];

  ngOnInit(): void {
    this.innerToolList = [...this.toolList];
    this.innerToolList.sort();
    this.innerToolList.forEach((tool: ToolData) => {
      const key = tool.name[0];
      const list = this.toolGroupList[key] || (this.toolGroupList[key] = []);
      list.push(tool);
    });
    this.toolGroupKeyList = Object.keys(this.toolGroupList).sort();
  }

  ngAfterViewInit(): void {
    this.groupHover(0);
  }
  updateFocus(): void {
    if (!this.isScrollToing) {
      return;
    }
    const groupEleList = this.toolGroupEleList.toArray();
    const toolScrollDOM = this.toolScrollContainer.directiveRef?.elementRef.nativeElement as HTMLElement;
    const scrollTop = toolScrollDOM.scrollTop;
    const index = groupEleList.findIndex((ele: ElementRef) => {
      const DOM = ele.nativeElement as HTMLElement;
      const rect = RectService.getOrgDOMRect(DOM);
      return DOM.offsetTop + rect.height / 3 > scrollTop;
    });
    this.setFocus(index);
    this.setSubFocus(index);
    this.cdRef.detectChanges();
  }

  scrollTo(index: number): void {
    if (!this.toolGroupEleList) {
      return;
    }
    this.isScrollToing = true;
    const eleList = this.toolGroupEleList.toArray();
    const groupDOM = eleList[index].nativeElement as HTMLElement;
    this.toolScrollContainer.directiveRef?.scrollToY(groupDOM.offsetTop, 500);
    setTimeout(() => {
      this.isScrollToing = false;
      this.cdRef.markForCheck();
    }, 500);
  }

  setSubHoverIndexList(index: number): void {
    this.subHoverIndexList[index - 1] = true;
    this.subHoverIndexList[index + 1] = true;
  }

  itemClick(itemDOM: HTMLElement, toolData: ToolData): void {
    const rect = RectService.getOrgDOMRect(itemDOM)
    toolData.onClick({
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height
    });
    this.putClose.emit();
  }

  groupHover(index: number): void {
    this.setFocus(index);
    this.setSubFocus(index);
    this.cdRef.detectChanges();
  }

  private setFocus(focusIndex: number): void {
    this.focusIndexList = [];
    // const toolScrollDOM = this.toolScrollContainer.directiveRef?.elementRef.nativeElement as HTMLElement;
    // const toolScrollTop = toolScrollDOM.scrollTop;
    // const toolScrollHeight = toolScrollDOM.scrollHeight;

    // if (toolScrollHeight - (toolScrollDOM.offsetHeight + toolScrollTop) < 60) {
    //   for (let i = focusIndex + 1, max = this.toolGroupKeyList.length; i < max; i++) {
    //     this.focusIndexList[i] = true;
    //   }
    // }
    this.focusIndexList[focusIndex] = true;
    this.scrollToShowDot(focusIndex);
  }

  private setSubFocus(focusIndex: number): void {
    this.subFocusIndexList = [];
    this.subFocusIndexList[focusIndex - 1] = true;
    this.subFocusIndexList[focusIndex + 1] = true;

  }

  private scrollToShowDot(focusIndex: number): void {
    const dotEleList = this.dotList.toArray();
    const dotScrollDOM = this.dotScrollContainer.directiveRef?.elementRef.nativeElement as HTMLElement;
    const dotScrollTop = dotScrollDOM.scrollTop;

    const dotDOM = dotEleList[focusIndex].nativeElement as HTMLElement;
    if (
      dotDOM.offsetTop < dotScrollTop ||
      (dotScrollTop + dotScrollDOM.offsetHeight) - (dotDOM.offsetHeight + dotDOM.offsetTop) < 0
    ) {
      this.dotScrollContainer.directiveRef?.scrollToY(dotDOM.offsetTop, 100);
    }
  }

}
