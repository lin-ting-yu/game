import { Component, EventEmitter, HostListener, Input, OnInit, Output, ElementRef, ViewChild } from '@angular/core';
import { RectService } from 'projects/data/src/lib/service';
import { DOMRect } from 'projects/data/src/lib/interface';

@Component({
  selector: 'app-desktop-item',
  templateUrl: './desktop-item.component.html',
  styleUrls: ['./desktop-item.component.scss']
})
export class DesktopItemComponent implements OnInit {

  constructor() { }

  @ViewChild('iconDOM') iconDOM: ElementRef;
  @Input() readonly icon: string;
  @Input() readonly name: string;
  @Output() onDblclick = new EventEmitter<DOMRect>();

  @HostListener('dblclick') dblclick(): void {
    this.onDblclick.emit(
      RectService.getDomRect(this.iconDOM.nativeElement)
    );
  }
  ngOnInit(): void {
  }

}
