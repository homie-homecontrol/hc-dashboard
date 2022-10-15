import { Component, OnInit } from '@angular/core';
import { GroupWidget } from 'src/app/models/dash.model';
import { WidgetBaseComponent } from '../../widget-base.control';

@Component({
  selector: 'hc-group-widget',
  templateUrl: './group-widget.component.html',
  styleUrls: ['./group-widget.component.scss']
})
export class GroupWidgetComponent extends WidgetBaseComponent<GroupWidget> implements OnInit {

  ngOnInit(): void {
  }

}
