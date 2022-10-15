import { Component, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { ToggleButtonWidget } from 'src/app/models/dash.model';
import { WidgetBaseComponent } from '../../widget-base.control';

@Component({
  selector: 'hc-toggle-button-widget',
  templateUrl: './toggle-button-widget.component.html',
  styleUrls: ['./toggle-button-widget.component.scss']
})
export class ToggleButtonWidgetComponent extends WidgetBaseComponent<ToggleButtonWidget> implements OnInit {

  state$ = this.state.properties.makePropertValueStream(this.widget.mappings?.switch).pipe(
    map(value => value === 'true')
  );

  ngOnInit(): void {
  }

  toggle(value : string){
    this.api.setProperty(this.widget.mappings?.switch, value).subscribe();
  }

}
