import { Component, EventEmitter, HostListener, Input, OnInit, Output, ElementRef, ViewChild } from '@angular/core';
import { DOMRect } from './../shared';

@Component({
  selector: 'app-desktop-item',
  templateUrl: './desktop-item.component.html',
  styleUrls: ['./desktop-item.component.scss']
})
export class DesktopItemComponent implements OnInit {

  constructor() { }

  @ViewChild('icon') iconDOM: ElementRef;
  @Input() readonly icon: string;
  @Input() readonly name: string;
  @Output() onDblclick = new EventEmitter<DOMRect>();

  @HostListener('dblclick') dblclick(): void {
    const rect = (this.iconDOM.nativeElement as HTMLElement).getBoundingClientRect();
    this.onDblclick.emit({
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height
    });
  }
  ngOnInit(): void {
  }

}
