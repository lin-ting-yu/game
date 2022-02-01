import { Component, EventEmitter, Input, OnInit, Output, HostListener } from '@angular/core';
import { RightManuItem } from 'projects/data/src/lib/interface';

@Component({
  selector: 'app-right-menu',
  templateUrl: './right-menu.component.html',
  styleUrls: ['./right-menu.component.scss']
})
export class RightMenuComponent {


  @Input() readonly rightItemList: RightManuItem[];
  @Output() putClose = new EventEmitter<void>();


  itemClick(item: RightManuItem, event: MouseEvent): void {
    if (item.isDisabled) {
      return;
    }
    this.putClose.emit();
    item.onClick(event)
  }

}
