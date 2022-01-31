import { Component, HostListener } from '@angular/core';
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {


  constructor(
    private deviceService: DeviceDetectorService
  ) {}
  @HostListener('window:resize', ['$event.target']) hostResise(event: any) {
    this.checkSize()
  }

  itDesktop: boolean;
  isBroke: boolean;

  ngOnInit(): void {
    this.itDesktop = this.deviceService.isDesktop();
  }
  ngAfterViewInit(): void {
    this.checkSize();
  }

  private checkSize(): void {
    if (window.innerWidth < 800 || window.innerHeight < 500) {
      this.isBroke = true;
    } else {
      this.isBroke = false;
    }
  }
}
