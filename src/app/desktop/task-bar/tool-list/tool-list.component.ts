import { Component, Input, OnInit, ViewChildren, QueryList, ElementRef, ViewChild, HostListener, Output, EventEmitter, HostBinding } from '@angular/core';
import { showToolList } from '../../shared/animate';
import { ToolData } from '../../shared/interface';

@Component({
  selector: 'app-tool-list',
  templateUrl: './tool-list.component.html',
  styleUrls: ['./tool-list.component.scss'],
  animations: [showToolList]
})
export class ToolListComponent implements OnInit {

  constructor() { }

  @ViewChildren('toolGroup') toolGroupEleList: QueryList<ElementRef>;
  @ViewChildren('dot') dotList: QueryList<ElementRef>;
  @ViewChild('dotScrollContainer') dotScrollContainer: ElementRef;
  @ViewChild('toolScrollContainer') toolScrollContainer: ElementRef;

  @Input() readonly toolList: ToolData[];
  @Output() putClose = new EventEmitter();

  @HostBinding('@showToolList')
  @HostListener('@showToolList.done') animatieDone() {
    this.isShown = true;
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
    this.updateFocus();
  }
  updateFocus(): void {
    const groupEleList = this.toolGroupEleList.toArray();
    const toolScrollDOM = this.toolScrollContainer.nativeElement as HTMLElement;
    const scrollTop = toolScrollDOM.scrollTop;

    const index = groupEleList.findIndex((ele: ElementRef) => {
      const DOM = ele.nativeElement as HTMLElement;
      const rect = DOM.getBoundingClientRect();
      return DOM.offsetTop + rect.height / 3 > scrollTop;
    });
    this.setFocus(index);
    this.setSubFocus(index);
  }

  scrollTo(index: number): void {
    if (!this.toolGroupEleList) {
      return;
    }
    const eleList = this.toolGroupEleList.toArray();
    eleList[index].nativeElement.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "end",
    });
  }

  setSubHoverIndexList(index: number): void {
    this.subHoverIndexList[index - 1] = true;
    this.subHoverIndexList[index + 1] = true;
  }

  private setFocus(focusIndex: number): void {
    this.focusIndexList = [];
    const toolScrollDOM = this.toolScrollContainer.nativeElement as HTMLElement;
    const toolScrollTop = toolScrollDOM.scrollTop;
    const toolScrollHeight = toolScrollDOM.scrollHeight;

    if (toolScrollHeight - (toolScrollDOM.offsetHeight + toolScrollTop) < 60) {
      for (let i = focusIndex + 1, max = this.toolGroupKeyList.length; i < max; i++) {
        this.focusIndexList[i] = true;
      }
    }
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
    const dotScrollDOM = this.dotScrollContainer.nativeElement as HTMLElement;
    const dotScrollTop = dotScrollDOM.scrollTop;

    const dotDOM = dotEleList[focusIndex].nativeElement as HTMLElement;
    if (
      dotDOM.offsetTop < dotScrollTop ||
      (dotScrollTop + dotScrollDOM.offsetHeight) - (dotDOM.offsetHeight + dotDOM.offsetTop) < 0
    ) {
      dotDOM.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "end",
      });
    }
  }

}
