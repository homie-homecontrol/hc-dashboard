import { Component, Input} from '@angular/core';


@Component({
  selector: 'hc-bbqchannel-temp-bar',
  templateUrl: './bbqchannel-temp-bar.component.html',
  styleUrls: ['./bbqchannel-temp-bar.component.scss']
})
export class BBQChannelTempBarComponent {
  _min: number = 0;
  _max: number = 0;
  _temp: number = 0;

  @Input() set min(value: number) {
    this._min = value;
    this.calcBarLengths();
  }
  get min(): number {
    return this._min;
  }


  @Input() set max(value: number) {
    this._max = value;
    this.tempRange = 0;
    this.calcBarLengths();
  };
  get max(): number {
    return this._max;
  }

  @Input() set temp(value: number) {
    this._temp = value;
    this.calcBarLengths();
  };

  get temp(): number {
    return this._temp;
  }

  @Input() unit: string = "";

  positionMin = 0;
  positionMax = 0;
  positionTemp = 0;

  tempRange = 0;

  delta = 1;

  constructor() { }

  calcBarLengths() {
    if (this.tempRange === 0) {
      this.tempRange = Math.floor(Math.max(this._max, this._temp) * 1.2);
    }
    else {
      if (this._temp > this.tempRange) { this.tempRange = Math.floor(this._temp * 1.2) }

      if (this._temp > this._max && this._temp * 1.2 < this.tempRange) { this.tempRange = Math.max(Math.floor(this._temp) + 1, this._max * 1.2); }
    }

    this.positionMin = this._min / this.tempRange * 100;    
    this.positionMax = this._max / this.tempRange * 100;
    this.positionTemp = this._temp / this.tempRange * 100;


  }


}
