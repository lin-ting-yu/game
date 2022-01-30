import { Component, ComponentRef, ElementRef, EventEmitter, HostBinding, HostListener, Input, OnChanges, OnInit, Output, SimpleChange, SimpleChanges, ViewChild, ViewContainerRef } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { Position } from 'projects/minesweeper/src/public-api';
import { SizeControlType, UpdateOpenRect, DOMRect, WindowData, ContentData } from '../shared/interface';

@Component({
  selector: 'app-window',
  templateUrl: './window.component.html',
  styleUrls: ['./window.component.scss']
})
export class WindowComponent implements OnInit, OnChanges {

  constructor(
    private el: ElementRef,
    private sanitizer: DomSanitizer,
  ) { }

  @ViewChild('bodyContent', { read: ViewContainerRef }) bodyContent: ViewContainerRef;
  @Input() readonly windowData: WindowData;
  @Input() readonly openRect: DOMRect;
  @Input() readonly isCollapse: boolean;
  @Input() readonly content: ContentData;

  @Output() onClickCollapse = new EventEmitter<string>();
  @Output() onClickZoom = new EventEmitter<void>();
  @Output() onClickClose = new EventEmitter<string>();
  @Output() onUpdateSelect = new EventEmitter<string>();
  @Output() onUpdateOpenRect = new EventEmitter<UpdateOpenRect>();

  @HostBinding('style')
  get hostStyle(): SafeStyle {
    return this.sanitizer.bypassSecurityTrustStyle(
      `transform: ${this.innerTranslate}; ` +
      `width: ${this.innerWidth}; ` +
      `height: ${this.innerHeight}; `
    );
  }

  @HostBinding('class')
  get hostClass(): string {
    return (
      `${this.isCssMoving ? 'moving ' : ''}` +
      `${this.isCollapse ? 'collapse ' : ''}` +
      `${this.windowData.isFocus ? 'focus ' : ''}`
    );
  }

  @HostListener('document:mousemove', ['$event']) mousemove(event: MouseEvent) {
    if (this.isItemDown) {
      return;
    }
    this.handleMoveChange(event);
    this.handleSizeChange(event);
  }
  @HostListener('document:mouseup', ['$event']) mouseup() {
    this.isHeaderDown = false;
    this.isSizeControlDown = false;
    this.isItemDown = false;
  }
  @HostListener('transitionend') transitionend() {
    this.isCssMoving = false;
  }

  readonly SizeControlType = SizeControlType;

  isItemDown = false;
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

  private contentComponent: ComponentRef<unknown>;

  selectText = '';

  ngOnInit(): void {
    if (this.isCollapse) {
      this.innerStyle(this.calcCloseRect(this.windowData.closeRect), 0);
    } else {
      this.innerStyle(this.windowData.openRect);
    }
    this.setSelectText();
  }

  ngOnChanges(changes: {
    openRect: SimpleChange;
    isCollapse: SimpleChange;
    content: SimpleChange;
  }): void {
    if (changes.openRect && this.openRect) {
      if (!this.isCollapse) {
        this.innerStyle(this.windowData.openRect);
      }
    }
    if (changes.isCollapse && typeof changes.isCollapse.previousValue === 'boolean') {
      if (this.isCollapse) {
        this.closeWindow();
      } else {
        this.openWindow();
      }
    }
    if (changes.content && !changes.content.firstChange) {
      this.createContent();
    }
  }

  ngOnDestroy(): void {
    if (this.contentComponent) {
      this.contentComponent.destroy();
    }
  }
  ngAfterViewInit(): void {
    this.createContent();
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

  updateSelect(): void {
    this.setSelectText();
    this.onUpdateSelect.emit(this.windowData.select?.value);
  }

  private setSelectText(): void {
    if (this.windowData.isDisabledSelect || !this.windowData.select) {
      return;
    }
    this.selectText = this.windowData.select.options.find(
      option => option.value === this.windowData.select?.value
    )?.text || '';
  }

  private saveMouseDate(event: MouseEvent): void {
    this.orgOpenRect = { ...this.windowData.openRect };
    this.startDownPos.x = event.x;
    this.startDownPos.y = event.y;
  }

  private innerStyle(DOMRect: DOMRect, scale = 1): void {
    this.innerTranslate = `translate(${DOMRect.x}px, ${DOMRect.y}px) scale(${scale})`;
    this.innerWidth = `${DOMRect.width}px`;
    this.innerHeight = `${DOMRect.height}px`;
  }

  private handleMoveChange(event: MouseEvent): void {
    if (!this.isHeaderDown) {
      return;
    }
    this.onUpdateOpenRect.emit({
      type: 'move',
      sizeControlType: null,
      rect: {
        width: this.windowData.openRect.width,
        height: this.windowData.openRect.height,
        x: this.orgOpenRect.x + event.x - this.startDownPos.x,
        y: this.orgOpenRect.y + event.y - this.startDownPos.y,
      }
    });
  }

  private handleSizeChange(event: MouseEvent): void {
    if (!this.isSizeControlDown || this.windowData.isDisabledControlSize) {
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
    this.onUpdateOpenRect.emit({
      type: 'resize',
      sizeControlType: this.sizeControlType,
      rect: newRect
    });

  }

  private calcCloseRect(close: DOMRect): DOMRect {
    return {
      x: close.x + (
        close.width - this.windowData.openRect.width
      ) / 2,
      y: close.y - this.windowData.openRect.height / 2 + close.height / 2,
      width: this.windowData.openRect.width,
      height: this.windowData.openRect.height,
    };
  }
  private closeWindow(): void {
    this.isCssMoving = true;

    setTimeout(() => {
      this.innerStyle(this.calcCloseRect(this.windowData.closeRect), 0);
    }, 0);
  }
  private openWindow(): void {
    this.innerStyle(this.calcCloseRect(this.windowData.closeRect), 0);
    setTimeout(() => {
      this.isCssMoving = true;
      setTimeout(() => {
        this.innerStyle(this.windowData.openRect);
      }, 0);
    }, 0);
  }

  private createContent(): void {
    if (!this.windowData.content) {
      return;
    }
    if (this.contentComponent) {
      this.contentComponent.destroy();
    }
    this.contentComponent = this.bodyContent.createComponent(this.windowData.content.component);
    if (!this.windowData.content || !this.contentComponent) {
      return;
    }
    const inputs = this.windowData.content.inputs;
    if (inputs) {
      Object.keys(inputs).forEach(key => {
        (this.contentComponent as any).instance[key] = inputs[key];
      });
    }

  }

}
