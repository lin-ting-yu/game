import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ToolData } from '../shared/interface';
import * as dayjs from 'dayjs';

@Component({
  selector: 'app-task-bar',
  templateUrl: './task-bar.component.html',
  styleUrls: ['./task-bar.component.scss'],
})
export class TaskBarComponent implements OnInit, OnDestroy {

  constructor() { }

  @Input() readonly toolList: ToolData[];


  hour = '';
  minute = '';
  today = '';

  isOpenToolList = false;

  private interval: NodeJS.Timer;

  ngOnInit(): void {
    this.setTime();
    this.interval = setInterval(() => {
      this.setTime();
    }, 1000);
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
