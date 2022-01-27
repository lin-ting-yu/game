import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WindowComponent } from './window/window.component';
import { TaskBarComponent } from './task-bar/task-bar.component';
import { DesktopComponent } from './desktop.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { HttpClientModule } from '@angular/common/http';
import { BarItemComponent } from './task-bar/bar-item/bar-item.component';



@NgModule({
  declarations: [
    WindowComponent,
    TaskBarComponent,
    DesktopComponent,
    BarItemComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    AngularSvgIconModule.forRoot()
  ],
  exports: [
    WindowComponent,
    TaskBarComponent,
    DesktopComponent
  ]
})
export class DesktopModule { }
