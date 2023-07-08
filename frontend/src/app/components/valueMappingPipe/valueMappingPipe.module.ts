import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ValueMappingPipe } from './valueMappingPipe.pipe';



@NgModule({
  declarations: [
    ValueMappingPipe
  ],
  exports:[
    ValueMappingPipe
  ],
  imports: [
    CommonModule
  ]
})
export class valueMappingPipeModule { }
