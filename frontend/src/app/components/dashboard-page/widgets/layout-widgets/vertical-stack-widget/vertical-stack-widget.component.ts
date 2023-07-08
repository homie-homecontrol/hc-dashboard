import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { VerticalStackWidget, Widget } from 'src/app/models/dash.model';
import { WidgetBaseComponent } from '../../widget-base.control';
import { evaluateValueCondition } from 'node-homie/util';
import { Observable, of, map } from 'rxjs';
import { LayoutWidgetBaseComponent } from '../../layoutwidget-base.control';

@Component({
  selector: 'hc-vertical-stack-widget',
  templateUrl: './vertical-stack-widget.component.html',
  styleUrls: ['./vertical-stack-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VerticalStackWidgetComponent extends LayoutWidgetBaseComponent<VerticalStackWidget> implements OnInit {

  ngOnInit(): void {
  }

}
