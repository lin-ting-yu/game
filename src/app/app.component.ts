import { environment } from 'src/environments/environment';
import { Component, HostListener } from '@angular/core';
import { DeviceDetectorService } from 'ngx-device-detector';
import * as createjs from 'createjs-module';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {


  constructor(
    private deviceService: DeviceDetectorService
  ) {
    createjs.Ticker.timingMode = createjs.Ticker.RAF;
  }
  @HostListener('document:contextmenu') contextmenu(): boolean {
    return !environment.production;
  }
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
