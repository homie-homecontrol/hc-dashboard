import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ConditionalWidget, ContainerlWidget } from 'src/app/models/dash.model';
import { LayoutWidgetBaseComponent } from '../../layoutwidget-base.control';

@Component({
  selector: 'hc-container-widget',
  templateUrl: './container-widget.component.html',
  styleUrls: ['./container-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContainerWidgetComponent extends LayoutWidgetBaseComponent<ContainerlWidget> implements OnInit {

   ngOnInit(): void {
  }

}