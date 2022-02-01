import { Directive, ElementRef, Input, Renderer2 } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Directive({
  selector: '[cachedSrc]'
})
export class CachedSrcDirective {

  constructor(
    private elRef: ElementRef,
    private renderer: Renderer2,
    private sanitizer: DomSanitizer
  ) { }

  @Input()
  get cachedSrc(): string {
    return this.elRef.nativeElement.src;
  }
  set cachedSrc(src: string) {
    if (this.elRef.nativeElement.src !== src) {
      this.renderer.setAttribute(
        this.elRef.nativeElement,
        'src',
        src
      );
    }
  }


}
