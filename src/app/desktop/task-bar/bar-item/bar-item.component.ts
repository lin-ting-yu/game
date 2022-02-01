import { Component, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BarItemClickData, DOMRect } from 'projects/data/src/lib/interface';

@Component({
  selector: 'app-bar-item',
  templateUrl: './bar-item.component.html',
  styleUrls: ['./bar-item.component.scss']
})
export class BarItemComponent {

  constructor() { }


  @Input() readonly id: string;
  @Input() readonly icon: string;
  @Input() readonly name: string;
  @Input() readonly isFocus: boolean;
  @Output() onItemClick = new EventEmitter<BarItemClickData>();


  // 實際邏輯在 TaskBarComponent
  getRect(): DOMRect {
    return {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    };
  }

}
