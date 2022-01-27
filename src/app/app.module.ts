import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { DesktopModule } from './desktop/desktop.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    DesktopModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
