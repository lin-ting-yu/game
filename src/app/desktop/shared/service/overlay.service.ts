import { ApplicationRef, ComponentFactoryResolver, ComponentRef, ElementRef, Injectable, Injector, Type, ViewContainerRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { DOMRect } from 'projects/data/src/lib/interface';
import { DesktopService, RectService } from 'projects/data/src/lib/service';

@Injectable({
  providedIn: 'root'
})
export class OverlayService {

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private applicationRef: ApplicationRef,
    private injector: Injector,
    private sanitizer: DomSanitizer,
    private desktopService: DesktopService,
  ) { }

  private DOM: HTMLElement;

  private getOverlayContainer(): HTMLElement {
    if (!this.DOM) {
      const container = document.createElement('div') as HTMLElement;
      const style = document.createElement('style');
      style.setAttribute('type', 'text/css');
      style.innerHTML = `
        .game-overlay-container {
          width: 100%;
          height: 100%;
          position: absolute;
          top: 0;
          left: 0;
          pointer-events: none;
          z-index: 999999;
        }

        .game-overlay-background {
          width: 100%;
          height: 100%;
          position: absolute;
          top: 0;
          left: 0;
          pointer-events: auto;
        }

        .game-overlay-container .game-component-container {
          position: absolute;
          pointer-events: auto;
        }

        .game-overlay-container .game-component-container.loading {
          opacity: 0;
        }
      `;
      document.head.appendChild(style);
      container.classList.add('game-overlay-container');
      this.DOM = container;

      document.body.appendChild(this.DOM);
    }
    return this.DOM;
  }

  private createComponentContainer(): HTMLElement {
    const container = document.createElement('div') as HTMLElement;
    container.classList.add('game-component-container');
    return container;
  }

  private createBg(): HTMLElement {
    const div = document.createElement('div');
    div.classList.add('game-overlay-background');
    return div;
  }


  openOverlay<T>(
    position: { x: number; y: number; },
    component: Type<any>,
    inputs?: { [key: string]: any; }
  ): {
    componentRef: ComponentRef<T>,
    destroy: () => void,
    update: () => void;
  } {
    const factory =
      this.componentFactoryResolver.resolveComponentFactory(component);
    const componentRef = factory.create(this.injector);
    const { nativeElement } = componentRef.location;

    if (inputs) {
      Object.keys(inputs).forEach(key => {
        componentRef.instance[key] = inputs[key];
      })
    }

    const safeNativeElement = (
      this.sanitizer.bypassSecurityTrustHtml(nativeElement) as any
    )['changingThisBreaksApplicationSecurity'];
    this.applicationRef.attachView(componentRef.hostView);
    const bg = this.createBg();
    bg.addEventListener('click', () => {
      destroy();
    });
    bg.addEventListener('contextmenu', () => {
      destroy();
    });
    this.getOverlayContainer().appendChild(bg);

    const conponentContainer = this.createComponentContainer();
    this.getOverlayContainer().appendChild(conponentContainer);

    // 加到畫面上
    conponentContainer.appendChild(safeNativeElement);
    conponentContainer.classList.add('loading');

    const checkPos = () => {
      const desktoRect = this.desktopService.getRect();
      const cptRect = RectService.getOrgDOMRect(safeNativeElement);
      let translateX: string = '';
      let translateY: string = '';
      conponentContainer.classList.remove('loading');
      conponentContainer.style.top = `${position.y - desktoRect.y}px`;
      conponentContainer.style.left = `${position.x - desktoRect.x}px`;

      // show left
      if (cptRect.width + position.x > desktoRect.width) {
        translateX = '-100%';
      } else {
        translateX = '0';
      }

      // show top
      if (cptRect.height + position.y > desktoRect.height) {
        translateY = '-100%';
      } else {
        translateY = '0';
      }
      conponentContainer.style.transform = `translate(${translateX}, ${translateY})`;
    };
    let isDestroy = false;
    const destroy = () => {
      if (isDestroy) {
        return;
      }
      isDestroy = true;
      this.getOverlayContainer().removeChild(bg);
      this.getOverlayContainer().removeChild(conponentContainer);
      componentRef.destroy();
    }
    setTimeout(() => {
      checkPos();
    }, 0);


    return {
      componentRef,
      destroy: () => destroy(),
      update: () => {
        checkPos();
      }
    };
  }
}
