import { Component, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { LightSceneWidget, MftLightSceneWidget } from 'src/app/models/dash.model';
import { WidgetBaseComponent } from '../../widget-base.control';

@Component({
  selector: 'hc-mft-light-scene-widget',
  templateUrl: './mft-light-scene-widget.component.html',
  styleUrls: ['./mft-light-scene-widget.component.scss']
})
export class MftLightSceneWidgetComponent extends WidgetBaseComponent<MftLightSceneWidget> implements OnInit {

  scenes$ = this.state.properties.selectProperty(this.widget.mappings?.scenes).pipe(
    map(prop => prop.format?.split(','))
  )

  ngOnInit(): void {
  }

  recall(value : string){
    console.log('setting scene: ', value)
    this.api.setProperty(this.widget.mappings?.scenes, value).subscribe();
  }

}
