import { animate, state, style, transition, trigger } from "@angular/animations";


const closeData = { transform: 'translateY(100px) scaleY(0.8)', opacity: 0, };
const openData = { transform: 'translateY(0px) scaleY(1)', opacity: 1, };
export const showToolList = trigger(
  'showToolList',
  [
    transition(':enter', [
      style(closeData),
      animate(
        '0.3s cubic-bezier(0.49, 0.06, 0.09, 0.99)',
        style(openData)
      ),

    ]),
    transition(':leave', [
      style(openData),
      animate(
        '0.3s cubic-bezier(0.13, 0.65, 0.68, 0.93)',
        style(closeData)
      ),

    ]),
  ]
);
