import { Component, Inject, OnInit } from '@angular/core';
import { LaunchOptions } from 'src/app/models/dash.model';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DashboardStateService } from '../state/dashboard-state.service';

@Component({
  selector: 'hc-launch-dialog',
  templateUrl: './launch-dialog.component.html',
  styleUrls: ['./launch-dialog.component.scss']
})
export class LaunchDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: LaunchOptions, public state: DashboardStateService,public dialogRef: MatDialogRef<LaunchDialogComponent>) { }

  ngOnInit(): void {
  }

  closeDialog(){
    this.dialogRef.close();
  }

}


