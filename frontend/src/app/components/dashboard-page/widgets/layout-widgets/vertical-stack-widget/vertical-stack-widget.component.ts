import { Component, OnInit } from '@angular/core';
import { VerticalStackWidget } from 'src/app/models/dash.model';
import { WidgetBaseComponent } from '../../widget-base.control';

@Component({
  selector: 'hc-vertical-stack-widget',
  templateUrl: './vertical-stack-widget.component.html',
  styleUrls: ['./vertical-stack-widget.component.scss']
})
export class VerticalStackWidgetComponent extends WidgetBaseComponent<VerticalStackWidget> implements OnInit {

  ngOnInit(): void {
  }

}
