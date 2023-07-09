import { Component, Input, OnInit } from '@angular/core';
import { MatColorName } from 'src/app/models/dash.model';
import { bgColorSchemeCssMapping } from '../mulit-function-tile.func';

@Component({
  selector: 'hc-tile',
  templateUrl: './tile.component.html',
  styleUrls: ['./tile.component.scss']
})
export class HcTileComponent implements OnInit {
  /** Set the background color for the status container */
  @Input()
  get bgColor(): MatColorName {
    return this._bgColor;
  }
  set bgColor(v: MatColorName) {
    this._bgColor = v;
    this.containerBgColorClass = bgColorSchemeCssMapping(this._bgColor, 'lighter');
    console.log('BGColorClass', this._bgColor, this.containerBgColorClass);
  }
  private _bgColor: MatColorName = 'primary';
  public containerBgColorClass = bgColorSchemeCssMapping(this._bgColor, 'lighter');

  /** Set the size of the widget */
  @Input()
  get size(): 'small' | 'normal' {
    return this._size;
  }
  set size(v: 'small' | 'normal') {
    this._size = v;
  }
  private _size: 'small' | 'normal' = 'normal';



  ngOnInit(): void {
  }

}
