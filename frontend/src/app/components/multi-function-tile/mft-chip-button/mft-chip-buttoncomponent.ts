import { Component, Directive, Input, OnInit } from '@angular/core';
import { MatColorName } from 'src/app/models/dash.model';
import { bgColorSchemeCssMapping, indicatorColorSchemeCssMapping } from '../mulit-function-tile.func';

@Directive({
  selector: 'hc-mft-chip-icon, [hc-mft-chip-icon], [hcMftChipIcon]'
})
export class HcMftChipIconDirective { }

@Component({
  selector: 'hc-mft-chip-button',
  templateUrl: './mft-chip-button.component.html',
  styleUrls: ['./mft-chip-button.component.scss']
})
export class HcMftChipButtonComponent implements OnInit {

  /** Set the background color for the status container */
  @Input()
  get color(): MatColorName {
    return this._color;
  }
  set color(v: MatColorName) {
    this._color = v;
    this.colorClass=indicatorColorSchemeCssMapping(this._color);
    this.bgColorClass = bgColorSchemeCssMapping(this._color);
  }
  private _color: MatColorName = 'pale';
  public colorClass = indicatorColorSchemeCssMapping(this._color);
  public bgColorClass = bgColorSchemeCssMapping(this._color);


  constructor() {  }


  ngOnInit(): void {
  }

}
