import { Injectable } from '@angular/core';
import { DOMRect } from '../interface';

@Injectable({
  providedIn: 'root'
})
export class RectService {

  constructor() { }

  static parentTagName = '';

  static getDomRect(DOM: HTMLElement): DOMRect {
    let innerDOM: HTMLElement = DOM;
    let x = 0;
    let y = 0;
    let prevOffsetParent: HTMLElement | null = null;

    const fn = () => {
      const offsetParent = innerDOM.offsetParent as HTMLElement;
      const parentElement = innerDOM.parentElement;
      if (prevOffsetParent !== offsetParent) {
        prevOffsetParent = offsetParent;
        x += innerDOM.offsetLeft;
        y += innerDOM.offsetTop;
      }

      x -= parentElement?.scrollLeft || 0;
      y -= parentElement?.scrollTop || 0;
      if (parentElement && parentElement.tagName !== this.parentTagName) {
        innerDOM = parentElement as HTMLElement;
        fn();
      }
    };
    fn();
    return {
      x,
      y,
      width: DOM.offsetWidth,
      height: DOM.offsetHeight,
    };
  }
}
