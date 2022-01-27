import { Component, ElementRef, EventEmitter, HostBinding, HostListener, Input, OnChanges, OnInit, Output, SimpleChange, SimpleChanges } from '@angular/core';
import * as createjs from 'createjs-module';
import { Position } from 'projects/minesweeper/src/public-api';
import { SizeControlType, UpdateOpenRect, DOMRect } from '../shared';

@Component({
  selector: 'app-window',
  templateUrl: './window.component.html',
  styleUrls: ['./window.component.scss']
})
export class WindowComponent implements OnInit, OnChanges {

  constructor(
    private el: ElementRef
  ) { }

  @Input() readonly id: string;
  @Input() readonly openRect: DOMRect;
  @Input() readonly closeRect: DOMRect;
  @Input() readonly isWidthFull: boolean;
  @Input() readonly isHeightFull: boolean;
  @Input() readonly zIndex: number;
  @Input() readonly isFocus: boolean;

  @Input() readonly isCollapse: boolean;
  @Input() readonly isShowSelect: boolean;
  @Input() readonly isCanControlSize: boolean;

  @Input() readonly isCollapseDisabled: boolean = true;
  @Input() readonly isZoomDisabled: boolean = true;
  @Input() readonly isCloseDisabled: boolean = true;
  @Output() onOpened = new EventEmitter<void>();
  @Output() onClosed = new EventEmitter<void>();

  @Output() collapseClick = new EventEmitter<string>();
  @Output() zoomClick = new EventEmitter<void>();
  @Output() closeClick = new EventEmitter<void>();
  @Output() updateOpenRect = new EventEmitter<UpdateOpenRect>();

  @HostBinding('style.transform') get translate() {
    return this.innerTranslate;
  }
  @HostBinding('style.width') get width() {
    return this.innerWidth;
  }
  @HostBinding('style.height') get height() {
    return this.innerHeight;
  }
  @HostBinding('style.z-index') get z() {
    return (this.isCollapse || this.isCssMoving) ? 9999999 : this.zIndex;
  }
  @HostBinding('style.opacity') get opacity() {
    return this.isCollapse ? 0 : 1;
  }
  @HostBinding('class.moving') get moving() {
    return this.isCssMoving;
  }
  @HostBinding('class.collapse') get collapse() {
    return this.isCollapse;
  }
  @HostListener('document:mousemove', ['$event']) mousemove(event: MouseEvent) {
    this.handleMoveChange(event);
    this.handleSizeChange(event);
  }
  @HostListener('document:mouseup', ['$event']) mouseup() {
    this.isHeaderDown = false;
    this.isSizeControlDown = false;
  }
  @HostListener('transitionend') transitionend() {
    this.isCssMoving = false;
  }

  readonly SizeControlType = SizeControlType;

  private isCssMoving = false;

  private innerTranslate: string = '';
  private innerWidth: string = '';
  private innerHeight: string = '';

  private startDownPos: Position = { x: 0, y: 0 };
  private orgOpenRect: DOMRect = { x: 0, y: 0, width: 0, height: 0 };

  // 尺寸控制
  private sizeControlType: SizeControlType;
  private isSizeControlDown = false;

  // 拖拉
  private isHeaderDown = false;


  ngOnInit(): void {
    if (this.isCollapse) {
      this.innerStyle(this.closeRect);
    } else {
      this.innerStyle(this.openRect);
    }
  }

  ngOnChanges(changes: {
    openRect: SimpleChange;
    isCollapse: SimpleChange;
  }): void {
    if (changes.openRect && this.openRect) {
      if (!this.isCollapse) {
        this.innerStyle(this.openRect);
      }
    }
    if (changes.isCollapse && typeof changes.isCollapse.previousValue === 'boolean') {
      if (this.isCollapse) {
        this.closeWindow();
      } else {
        this.openWindow();
      }
    }
  }

  updateState(): void {

  }

  headerDown(event: MouseEvent): void {
    event.preventDefault();
    this.isHeaderDown = true;
    this.saveMouseDate(event);
  }

  sizeControlDown(sizeControlType: SizeControlType, event: MouseEvent): void {
    event.preventDefault();
    this.isSizeControlDown = true;
    this.sizeControlType = sizeControlType;
    this.saveMouseDate(event);
  }

  close(): void {
    this.onClosed.emit();
  }

  open(): void {
    this.onOpened.emit();
  }

  private saveMouseDate(event: MouseEvent): void {
    this.orgOpenRect = { ...this.openRect };
    this.startDownPos.x = event.x;
    this.startDownPos.y = event.y;
  }

  private innerStyle(DOMRect: DOMRect): void {
    this.innerTranslate = `translate(${DOMRect.x}px, ${DOMRect.y}px)`;
    this.innerWidth = `${DOMRect.width}px`;
    this.innerHeight = `${DOMRect.height}px`;
  }

  private handleMoveChange(event: MouseEvent): void {
    if (!this.isHeaderDown) {
      return;
    }
    this.updateOpenRect.emit({
      type: 'move',
      rect: {
        width: this.openRect.width,
        height: this.openRect.height,
        x: this.orgOpenRect.x + event.x - this.startDownPos.x,
        y: this.orgOpenRect.y + event.y - this.startDownPos.y,
      }
    });
  }

  private handleSizeChange(event: MouseEvent): void {
    if (!this.isSizeControlDown || this.isCanControlSize) {
      return;
    }

    let newRect: DOMRect = { ...this.orgOpenRect };
    const xMove = event.x - this.startDownPos.x;
    const yMove = event.y - this.startDownPos.y;

    if (
      this.sizeControlType === SizeControlType.Top ||
      this.sizeControlType === SizeControlType.TopLeft ||
      this.sizeControlType === SizeControlType.TopRight
    ) {
      newRect.y += yMove;
      newRect.height -= yMove;
    }
    if (
      this.sizeControlType === SizeControlType.Right ||
      this.sizeControlType === SizeControlType.TopRight ||
      this.sizeControlType === SizeControlType.BottomRight
    ) {
      newRect.width += xMove;
    }
    if (
      this.sizeControlType === SizeControlType.Bottom ||
      this.sizeControlType === SizeControlType.BottomRight ||
      this.sizeControlType === SizeControlType.BottomLeft
    ) {
      newRect.height += yMove;
    }
    if (
      this.sizeControlType === SizeControlType.Left ||
      this.sizeControlType === SizeControlType.BottomLeft ||
      this.sizeControlType === SizeControlType.TopLeft
    ) {
      newRect.x += xMove;
      newRect.width -= xMove;
    }
    this.updateOpenRect.emit({
      type: 'resize',
      rect: newRect
    });

  }

  private closeWindow(): void {
    const rect = (this.el.nativeElement as HTMLElement).getBoundingClientRect();
    this.innerStyle({
      x: this.openRect.x,
      y: this.openRect.y,
      width: rect.width,
      height: rect.height
    });
    this.isCssMoving = true;
    setTimeout(() => {
      this.innerStyle(this.closeRect);
    }, 0);
  }
  private openWindow(): void {
    this.innerStyle(this.closeRect);
    this.isCssMoving = true;
    setTimeout(() => {
      this.innerStyle(this.openRect);
    }, 0);
  }

}
