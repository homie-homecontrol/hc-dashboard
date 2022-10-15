import { Component, OnInit } from '@angular/core';
import { isNotNullish } from 'node-homie/rx';
import { distinctUntilChanged, filter, map, tap } from 'rxjs/operators';
import { StateService } from 'src/app/services/state.service';

@Component({
  selector: 'hc-main-dashboard',
  templateUrl: './main-dashboard.component.html',
  styleUrls: ['./main-dashboard.component.scss']
})
export class MainDashboardComponent implements OnInit {

  pageId$ = this.state.activePage$.pipe(
    isNotNullish(),
    map(page => page.id),
    distinctUntilChanged()
  );

  constructor(private state: StateService) { }

  ngOnInit(): void {
  }

}
