import { Component, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BarItem, BarItemClickData, DOMRect } from './../../shared/interface';

@Component({
  selector: 'app-bar-item',
  templateUrl: './bar-item.component.html',
  styleUrls: ['./bar-item.component.scss']
})
export class BarItemComponent implements OnInit {

  constructor(
    private el: ElementRef,
  ) { }


  @Input() readonly id: string;
  @Input() readonly icon: string;
  @Input() readonly name: string;
  @Input() readonly isFocus: boolean;
  @Output() onItemClick = new EventEmitter<BarItemClickData>();

  ngOnInit(): void {
  }

  getRect(): DOMRect {
    const rect = (this.el.nativeElement as HTMLElement).getBoundingClientRect();
    return {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
    }
  }

  itemClick(): void {
    const rect = this.getRect();
    const r = {
      id: this.id,
      ...rect,
    };

    this.onItemClick.emit(r);
  }

}
