import { Component, EventEmitter, Input, OnInit, Output, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { Card } from 'src/app/models/dash.model';
import { LaunchDialogComponent } from '../../launch-dialog/launch-dialog.component';
import { DashboardStateService } from '../../state/dashboard-state.service';


@Component({
  selector: 'hc-card-header',
  templateUrl: './card-header.component.html',
  styleUrls: ['./card-header.component.scss']
})
export class CardHeaderComponent implements OnInit {

  @Input()
  card?: Card;

  @Input()
  hideLaunchButton?: boolean;

  @Output()
  cardAction = new EventEmitter<void>();

  constructor(public dialog: MatDialog, public state: DashboardStateService, private viewContainerRef: ViewContainerRef) { }

  ngOnInit(): void {

  }

  launch() {
    if (this.card) {
      this.dialog.open(LaunchDialogComponent, {
        data: this.card.launchOptions,
        maxWidth: 'unset',
        panelClass: this.card.launchOptions?.wide ? 'launch-dialog-container-wide' : 'launch-dialog-container',
        viewContainerRef: this.viewContainerRef
      })
    }
  }

}
