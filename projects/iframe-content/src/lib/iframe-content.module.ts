import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PipeModule } from 'projects/data/src/lib/pipe';
import { IframeContentComponent } from './iframe-content.component';
import { CachedSrcDirective } from './directive/cached-src.directive';



@NgModule({
  declarations: [
    IframeContentComponent,
    CachedSrcDirective
  ],
  imports: [
    CommonModule,
    PipeModule
  ],
  exports: [
    IframeContentComponent
  ]
})
export class IframeContentModule { }
