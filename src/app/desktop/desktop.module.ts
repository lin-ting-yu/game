import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WindowComponent } from './window/window.component';
import { TaskBarComponent } from './task-bar/task-bar.component';
import { DesktopComponent } from './desktop.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { HttpClientModule } from '@angular/common/http';
import { BarItemComponent } from './task-bar/bar-item/bar-item.component';
import { MinesweeperModule } from 'projects/minesweeper/src/public-api';
import { DesktopItemComponent } from './desktop-item/desktop-item.component';
import { ToolListComponent } from './task-bar/tool-list/tool-list.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};

@NgModule({
  declarations: [
    WindowComponent,
    TaskBarComponent,
    DesktopComponent,
    BarItemComponent,
    DesktopItemComponent,
    ToolListComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MinesweeperModule,
    AngularSvgIconModule.forRoot(),
    PerfectScrollbarModule,
  ],
  exports: [
    WindowComponent,
    TaskBarComponent,
    DesktopComponent,
  ],
  providers: [
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    }
  ]
})
export class DesktopModule { }
