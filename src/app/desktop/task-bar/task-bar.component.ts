import { Component, Input, OnDestroy, OnInit, Output, EventEmitter, ElementRef } from '@angular/core';
import { BarItem, BarItemClickData } from '../shared';
import * as dayjs from 'dayjs';

@Component({
  selector: 'app-task-bar',
  templateUrl: './task-bar.component.html',
  styleUrls: ['./task-bar.component.scss']
})
export class TaskBarComponent implements OnInit, OnDestroy {

  constructor() { }

  hour = '';
  minute = ''
  today = '';


  private interval: NodeJS.Timer;

  ngOnInit(): void {
    this.setTime();
    this.interval = setInterval(() => {
      this.setTime();
    }, 1000)
  }

  ngOnDestroy(): void {
    clearInterval(this.interval);
  }



  private setTime(): void {
    const day = dayjs();
    this.hour = day.format('A hh');
    this.minute = day.format('mm');
    this.today = day.format('YYYY/MM/DD');
  }


}
