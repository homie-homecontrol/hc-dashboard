import { Component, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { SwitchWidget } from 'src/app/models/dash.model';
import { WidgetBaseComponent } from '../../widget-base.control';

@Component({
  selector: 'hc-switch-widget',
  templateUrl: './switch-widget.component.html',
  styleUrls: ['./switch-widget.component.scss']
})
export class SwitchWidgetComponent extends WidgetBaseComponent<SwitchWidget> implements OnInit {

  state$ = this.state.properties.makePropertValueStream(this.widget.mappings?.switch).pipe(
    map(value => value === 'true')
  );

  ngOnInit(): void {
  }

  toggle(value: string){
    this.api.setProperty(this.widget.mappings?.switch, value).subscribe();
  }

}
