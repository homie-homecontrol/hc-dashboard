import { Component, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { ConditionalWidget } from 'src/app/models/dash.model';
import { WidgetBaseComponent } from '../../widget-base.control';
import { evaluateValueCondition } from 'node-homie/util';

@Component({
  selector: 'hc-conditional-widget',
  templateUrl: './conditional-widget.component.html',
  styleUrls: ['./conditional-widget.component.scss']
})
export class ConditionalWidgetComponent extends WidgetBaseComponent<ConditionalWidget> implements OnInit {

  condition$ = this.state.properties.makePropertValueStream(this.widget.config?.property).pipe(
    map(value => evaluateValueCondition(value, this.widget.config?.condition))
  )

  ngOnInit(): void {
  }

}