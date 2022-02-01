import { ChangeDetectorRef, Component, Input, OnInit, SimpleChanges, ViewChild, ElementRef, HostBinding } from '@angular/core';
import { WindowInnerComponent } from 'projects/data/src/lib/interface';


@Component({
  selector: 'lib-iframe-content',
  templateUrl: './iframe-content.component.html',
  styleUrls: ['./iframe-content.component.scss']
})
export class IframeContentComponent implements OnInit, WindowInnerComponent {

  @ViewChild('iframe') iframe: ElementRef;
  @Input() readonly src: string;
  @Input() readonly isFocus: boolean;
  @Input() readonly isCollapse: boolean;
  @Input() readonly isMoving: boolean;
  @Input() readonly isResizing: boolean;
  @HostBinding('class.focus') get focus() {
    return this.isFocus;
  }

  ngOnInit(): void {
  }
  ngOnChanges(changes: SimpleChanges): void {
  }

  windowUpdateInput(): void {

    if (this.isFocus && !this.isCollapse && !this.isMoving && !this.isResizing) {
      this.iframe?.nativeElement.contentWindow.focus();
    } else {
      window.focus();
    }
  }

}
