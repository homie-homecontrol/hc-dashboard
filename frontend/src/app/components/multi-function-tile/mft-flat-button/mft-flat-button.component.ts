import { Component, Directive, Input, OnInit } from '@angular/core';
import { MatColorName } from 'src/app/models/dash.model';
import { bgColorSchemeCssMapping, indicatorColorSchemeCssMapping } from '../mulit-function-tile.func';

@Component({
  selector: 'hc-mft-flat-button',
  templateUrl: './mft-flat-button.component.html',
  styleUrls: ['./mft-flat-button.component.scss']
})
export class HcMftFlatButtonComponent implements OnInit {

  /** Set the background color for the status container */
  @Input()
  get color(): MatColorName {
    return this._color;
  }
  set color(v: MatColorName) {
    this._color = v;
    this.colorClass=indicatorColorSchemeCssMapping(this._color);
  }
  private _color: MatColorName = 'pale';
  public colorClass = indicatorColorSchemeCssMapping(this._color)


  constructor() {  }


  ngOnInit(): void {
  }

}
