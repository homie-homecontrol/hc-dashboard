import { ChangeDetectionStrategy, Directive, ViewEncapsulation } from '@angular/core';
import { Component, OnInit } from '@angular/core';


@Directive({
  selector: 'hc-widget-controls, [hc-widget-controls], [hcWidgetControls]',
  host: {
    '[class.hc-widget-controls]': 'direction === undefined || direction === "horizontal"',
    '[class.hc-widget-controls-vertical]': 'direction === "vertical"',
  },
  inputs: ['direction'],
})
export class HcWidgetControlsDirective { }

@Directive({
  selector: 'hc-widget-label, [hc-widget-label], [hcWidgetLabel]',
  host: { 'class': 'hc-widget-label' }
})
export class HcWidgetLabelDirective { }

@Directive({
  selector: 'hc-widget-first-line, [hc-widget-first-line], [hcWidgetFirstLine]',
  host: {
    '[class.hc-widget-first-line]': 'direction === undefined || direction === "horizontal"',
    '[class.hc-widget-first-line-vertical]': 'direction === "vertical"',
    '[class.hc-widget-first-line-left]': 'position === "left"',
    '[class.hc-widget-first-line-center]': 'position === "center"',
  },
  inputs: ['direction', 'position'],
})
export class HcWidgetFirstLineDirective { }


@Directive({
  selector: 'hc-widget-second-line, [hc-widget-second-line], [hcWidgetSecondLine]',
  host: {
    '[class.hc-widget-second-line]': 'direction === undefined || direction === "horizontal"',
    '[class.hc-widget-second-line-vertical]': 'direction === "vertical"',
  },
  inputs: ['direction'],
})
export class HcWidgetSecondLineDirective { }

@Component({
  selector: 'hc-widget-layout',
  templateUrl: './widget-layout.html',
  styleUrls: ['./widget-layout.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // inputs: ['direction'],
  host: {
    'class': 'hc-widget-layout'
  }
})
export class HcWidgetLayoutComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
