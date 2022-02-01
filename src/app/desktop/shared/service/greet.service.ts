import { Injectable } from '@angular/core';
import { GreetComponent } from '../component/greet/greet.component';
import { OverlayService } from './overlay.service';

@Injectable({
  providedIn: 'root'
})
export class GreetService {

  constructor(
    private overlayService: OverlayService
  ) { }


  greet(x: number, y: number): void {
    setTimeout(() => {
      const greetOverlay = this.overlayService.openOverlay<GreetComponent>(
        { x: x - 10, y: y - 10 },
        GreetComponent
      );
      setTimeout(() => { greetOverlay.destroy() }, 1500);
    }, 500);
  }
}
