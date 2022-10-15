import { Component, OnInit } from '@angular/core';
import { parseCSVString } from 'node-homie/util';
import { tap } from 'rxjs';
import { map } from 'rxjs/internal/operators/map';
import { SelectWidget } from 'src/app/models/dash.model';
import { WidgetBaseComponent } from '../../widget-base.control';

@Component({
  selector: 'hc-select-widget',
  templateUrl: './select-widget.component.html',
  styleUrls: ['./select-widget.component.scss']
})
export class SelectWidgetComponent extends WidgetBaseComponent<SelectWidget> implements OnInit {
  value$ = this.state.properties.makePropertValueStream(this.widget.mappings?.value).pipe(tap(val =>{
    console.log('Select value:', val);
  }));
  enumOptions$ = this.state.properties.selectProperty(this.widget.mappings?.value).pipe(
    map(prop => {
      if (this.widget.config?.overrideOptionList) {
        return this.widget.config?.overrideOptionList;
      } else {
        if (prop.format !== null && prop.format !== undefined) {
          return parseCSVString(prop.format);
        } else {
          return [];
        }
      }
    })
  );
  enumLabels$=this.enumOptions$.pipe(
    map(options => {
      console.log("Labels:", this.widget.config?.optionsLabels);
      if (this.widget.config?.optionsLabels && this.widget.config?.optionsLabels.length === options.length){
        return this.widget.config?.optionsLabels
      }else{
        return options;
      }
    })
  )

  ngOnInit(): void {
  }

  setValue(value: any) {
    console.log(value);
    this.api.setProperty(this.widget.mappings?.value, value.value).subscribe();
  }

}
