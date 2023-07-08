import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { GroupWidget, Widget } from 'src/app/models/dash.model';
import { WidgetBaseComponent } from '../../widget-base.control';
import { Observable, map, of } from 'rxjs';
import { evaluateValueCondition } from 'node-homie/util';
import { LayoutWidgetBaseComponent } from '../../layoutwidget-base.control';

@Component({
  selector: 'hc-group-widget',
  templateUrl: './group-widget.component.html',
  styleUrls: ['./group-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GroupWidgetComponent extends LayoutWidgetBaseComponent<GroupWidget> implements OnInit {



  ngOnInit(): void {
  }



}
