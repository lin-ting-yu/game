
import { Component, HostBinding, OnInit } from '@angular/core';
import { showToolList } from 'projects/data/src/lib/animate';

const greetTextList = [
  'Yo!',
  'Hiya!',
  'Hi!',
  'Hey!',
  'Hello!',
  'Howdy',
  'Cool',
  'TIME'
];

@Component({
  selector: 'app-greet',
  templateUrl: './greet.component.html',
  styleUrls: ['./greet.component.scss'],
  animations: [showToolList]
})
export class GreetComponent implements OnInit {

  constructor() { }

  @HostBinding('@showToolList') animate() { }

  text: string;
  transform: string;

  ngOnInit(): void {
    this.text = greetTextList[~~(Math.random() * greetTextList.length)];
    this.transform = `rotate(-${Math.random() * 10}deg)`;
    if (this.text === 'TIME') {
      this.text = 'Good ';
      const hour = new Date().getHours();
      if (hour < 6) {
        this.text = 'Zzz...';
      } else if (hour < 12) {
        this.text += 'Morning';
      } else if (hour < 19) {
        this.text += 'Afternoon';
      } else {
        this.text += 'Evening';
      }
    }
  }


}
