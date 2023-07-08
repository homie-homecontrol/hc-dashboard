import { Component, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { ContactWidget, MFTTestWidget, OnlineWidget, OnOffWidget, PresenceWidget, TiltWidget } from 'src/app/models/dash.model';
import { WidgetBaseComponent } from '../../widget-base.control';

@Component({
  selector: 'hc-mft-test-widget',
  templateUrl: './mft-test-widget.component.html',
  styleUrls: ['./mft-test-widget.component.scss']
})
export class MFTTestWidgetComponent extends WidgetBaseComponent<MFTTestWidget> implements OnInit {
  value = 30;
  
  ngOnInit(): void {
  }

}
