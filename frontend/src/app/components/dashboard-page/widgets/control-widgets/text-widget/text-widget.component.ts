import { Component, OnInit } from '@angular/core';
import { TextWidget } from 'src/app/models/dash.model';
import { WidgetBaseComponent } from '../../widget-base.control';

@Component({
  selector: 'hc-text-widget',
  templateUrl: './text-widget.component.html',
  styleUrls: ['./text-widget.component.scss']
})
export class TextWidgetComponent extends WidgetBaseComponent<TextWidget> implements OnInit {

  text$ = this.state.properties.makePropertValueStream(this.widget.mappings?.text);

  ngOnInit(): void {
  }

}
