import { Component, EventEmitter, HostListener, Input, OnInit, Output, ElementRef, ViewChild } from '@angular/core';
import { RectService } from 'projects/data/src/lib/service';
import { DesktopItemContextmenu, DOMRect } from 'projects/data/src/lib/interface';

@Component({
  selector: 'app-desktop-item',
  templateUrl: './desktop-item.component.html',
  styleUrls: ['./desktop-item.component.scss']
})
export class DesktopItemComponent implements OnInit {

  constructor(
    private elementRef: ElementRef
  ) { }

  @ViewChild('iconDOM') iconDOM: ElementRef;
  @Input() readonly icon: string;
  @Input() readonly name: string;
  @Output() onDblclick = new EventEmitter<DOMRect>();
  @Output() onContextmenu = new EventEmitter<DesktopItemContextmenu>();

  @HostListener('dblclick') dblclick(): void {
    this.onDblclick.emit(
      RectService.getDOMRect(this.iconDOM.nativeElement)
    );
  }
  @HostListener('contextmenu', ['$event']) contextmenu(event: MouseEvent): boolean {
    this.onContextmenu.emit(
      {
        mouseEvent: event,
        rect: RectService.getDOMRect(this.elementRef.nativeElement)
      }
    )
    return false;
  }
  ngOnInit(): void {
  }

}
