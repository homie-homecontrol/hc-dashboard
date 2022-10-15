import { NgModule, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card'
// import { MatSnackBarModule } from '@angular/material/snack-bar'
// import { MatSidenavModule } from '@angular/material/sidenav'
// import { MatToolbarModule } from '@angular/material/toolbar'
// import { MatIconModule, MatIconRegistry } from '@angular/material/icon'
import { MatButtonModule } from '@angular/material/button'
import { MatButtonToggleModule } from '@angular/material/button-toggle'
// import { MatMenuModule } from '@angular/material/menu'
// import { MatInputModule } from '@angular/material/input'
// import { MatRippleModule } from '@angular/material/core'
import { MatSliderModule } from '@angular/material/slider'
// import { MatSelectModule } from '@angular/material/select'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
// import { MatBottomSheetModule } from '@angular/material/bottom-sheet'

import { PortalModule } from '@angular/cdk/portal';
import {MatGridListModule} from '@angular/material/grid-list';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatListModule } from '@angular/material/list';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
// import { MatDatepickerModule } from '@angular/material/datepicker';
// import { MatCheckboxModule } from '@angular/material/checkbox';
// import { MatTableModule } from '@angular/material/table';
// import { MatSortModule } from '@angular/material/sort';

import { MatExpansionModule } from '@angular/material/expansion';

@NgModule({
  imports: [
    CommonModule,
    PortalModule,

    MatCardModule,
    MatGridListModule,
    // MatSnackBarModule,
    // MatSidenavModule,
    // MatToolbarModule,
    // MatIconModule,
    MatButtonModule,
    MatButtonToggleModule,
    // MatMenuModule,
    // MatListModule,
    // MatInputModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    // MatAutocompleteModule,
    // MatStepperModule,
    MatDividerModule,
    // MatLineModule,
    // MatRippleModule,
    MatExpansionModule,
    // MatChipsModule,
    // MatGridListModule,
    MatSliderModule,
    // MatBottomSheetModule,
    // MatDialogModule,
    // MatSelectModule,
    // MatFormFieldModule,
    // MatDatepickerModule,
    // MatMomentDateModule,
    // MatCheckboxModule,
    // MatTableModule,
    // MatSortModule
    // MatMomentDateModule

  ],
  exports: [
    PortalModule,
    MatCardModule,
    MatGridListModule,
    // MatSnackBarModule,
    // MatSidenavModule,
    // MatToolbarModule,
    // MatIconModule,
    MatButtonModule,
    MatButtonToggleModule,
    // MatMenuModule,
    // MatListModule,
    // MatInputModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    // MatAutocompleteModule,
    // MatStepperModule,
    MatDividerModule,
    // MatLineModule,
    // MatRippleModule,
    MatExpansionModule,
    // MatChipsModule,
    // MatGridListModule,
    MatSliderModule,
    // MatBottomSheetModule,
    // MatDialogModule,
    // MatSelectModule,
    // MatFormFieldModule,

    // MatDatepickerModule,
    // MatMomentDateModule,
    // MatCheckboxModule,
    // MatTableModule,
    // MatSortModule
    // MatNativeDateModule
  ],
  declarations: [],
  providers: [
  ]
})
export class AppMaterialModule {

  constructor() {
  }
}
