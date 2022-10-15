import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { APIService } from 'src/app/services/api.service';
import { DashboardStateService } from './state/dashboard-state.service';
import { WebSocketAPIService } from '../../services/websocket-api.service';
import { ThemeService } from 'ng2-charts';

@Component({
  selector: 'hc-dashboard-page',
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.scss'],
  providers: [DashboardStateService, WebSocketAPIService]
})
export class DashboardPageComponent implements OnInit, OnDestroy {

  @Input()
  set pageId(value: string) {
    this.state.dashboardPageId = value;
  }

  @Input()
  set dialogMode(value: boolean) {
    if (value !== null && value !== undefined) {
      this.state.dialogMode = value;
    }
  }

  pageLayout$ = this.state.pageLayout$;

  constructor(public state: DashboardStateService, public wsapi: WebSocketAPIService, public api: APIService) { }

  ngOnInit(): void {
    // this.state.dashboardPageId=this.pageId;
  }

  ngOnDestroy(): void {
  }


}
