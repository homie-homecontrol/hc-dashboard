import { Component, OnInit } from '@angular/core';
import { map, take } from 'rxjs/operators';
import { MftSwitchWidget, SwitchWidget } from 'src/app/models/dash.model';
import { WidgetBaseComponent } from '../../widget-base.control';

@Component({
  selector: 'hc-mft-switch-widget',
  templateUrl: './mft-switch-widget.component.html',
  styleUrls: ['./mft-switch-widget.component.scss']
})
export class MftSwitchWidgetComponent extends WidgetBaseComponent<MftSwitchWidget> implements OnInit {

  state$ = this.state.properties.makePropertValueStream(this.widget.mappings?.switch).pipe(
    map(value => value === 'true')
  );

  sliderValue$ = this.state$.pipe(
    map(value => value ? 1 : 0)
  )

  ngOnInit(): void {
  }

  toggle(){
    this.state$.pipe(take(1)).subscribe({next: state => {
      this.api.setProperty(this.widget.mappings?.switch, !state).subscribe();
    }})
  }

  setState(value: number){
    this.state$.pipe(take(1)).subscribe({next: state => {
      this.api.setProperty(this.widget.mappings?.switch, value === 1).subscribe();
    }})
  }

}
