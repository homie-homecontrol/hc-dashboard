import { Component, OnInit } from '@angular/core';
import { PropertySelector } from 'node-homie/model';
import { map } from 'rxjs/operators';
import { ActionButtonsWidget } from 'src/app/models/dash.model';
import { WidgetBaseComponent } from '../../widget-base.control';

@Component({
  selector: 'hc-action-buttons-widget',
  templateUrl: './action-buttons-widget.component.html',
  styleUrls: ['./action-buttons-widget.component.scss']
})
export class ActionButtonsWidgetComponent extends WidgetBaseComponent<ActionButtonsWidget> implements OnInit {

  ngOnInit(): void {
  }

  setState(selector: PropertySelector, value: string){
    this.api.setProperty(selector, value).subscribe();
  }

}
