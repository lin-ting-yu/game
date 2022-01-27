import { Injectable } from '@angular/core';
import { DOMRect } from '..';

@Injectable({
  providedIn: 'root'
})
export class DesktopRectService {

  constructor() { }

  static readonly taskBarHeight = 40;
  static readonly windowHeaderHeight = 24;
  private DOM: HTMLElement;

  getRect(): DOMRect {
    const rect = this.DOM.getBoundingClientRect()
    return {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
    };
  }

  setDOM(DOM: HTMLElement) {
    this.DOM = DOM;
  }

}
