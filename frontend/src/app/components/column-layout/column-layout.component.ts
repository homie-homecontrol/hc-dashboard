import { ChangeDetectionStrategy, Directive, ViewEncapsulation } from '@angular/core';
import { Component, OnInit } from '@angular/core';


@Directive({
  selector: 'hc-column, [hc-column], [hcColumn]',
  host: {'class': 'hc-column'}
})
export class HcColumnDirective {}

@Directive({
  selector: 'hc-column-tile, [hc-column-tile], [hcColumnTile]',
  host: {'class': 'hc-column-tile'}
})
export class HcColumnTileDirective {}


@Component({
  selector: 'hc-column-layout',
  templateUrl: './column-layout.component.html',
  styleUrls: ['./column-layout.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'hc-column-layout'
  }
})
export class HcColumnLayoutComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
