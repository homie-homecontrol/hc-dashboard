import { Component, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { PushButtonWidget } from 'src/app/models/dash.model';
import { WidgetBaseComponent } from '../../widget-base.control';

@Component({
  selector: 'hc-push-button-widget',
  templateUrl: './push-button-widget.component.html',
  styleUrls: ['./push-button-widget.component.scss']
})
export class PushButtonWidgetComponent extends WidgetBaseComponent<PushButtonWidget> implements OnInit {

  ngOnInit(): void {
  }

  setState(){
    this.api.setProperty(this.widget.mappings?.target, this.widget.config?.setState).subscribe();
  }

}
