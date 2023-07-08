import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShowWhenPipe } from './showWhen.pipe';



@NgModule({
  declarations: [
    ShowWhenPipe
  ],
  exports:[
    ShowWhenPipe
  ],
  imports: [
    CommonModule
  ]
})
export class ShowWhenModule { }
