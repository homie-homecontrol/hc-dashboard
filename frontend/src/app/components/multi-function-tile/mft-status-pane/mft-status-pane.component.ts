import { Component, Directive, Input, OnInit } from '@angular/core';
import { MatColorType } from 'src/app/models/common.model';
import { bgColorSchemeCssMapping } from '../mulit-function-tile.func';
import { MatColorName } from 'src/app/models/dash.model';

@Component({
  selector: 'hc-mft-status-pane',
  templateUrl: './mft-status-pane.component.html',
  styleUrls: ['./mft-status-pane.component.scss']
})
export class HcMftStatusPaneComponent implements OnInit {

  /** Set the background color for the status pane */
  @Input()
  get color(): MatColorName {
    return this._color;
  }
  set color(v: MatColorName) {
    this._color = v;
    this.colorClass=bgColorSchemeCssMapping(this._color, 'lighter');
  }
  private _color: MatColorName = 'pale';
  public colorClass = bgColorSchemeCssMapping(this._color, 'lighter');


  constructor() {  }


  ngOnInit(): void {
  }

}
