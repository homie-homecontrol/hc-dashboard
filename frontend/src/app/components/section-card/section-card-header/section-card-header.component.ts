import { Component, Directive, OnInit } from '@angular/core';


@Directive({
  selector: 'hc-card-header-icon, [hc-card-header-icon], [CardHeaderIcon]',
  host: { 'class': 'big-icon' }
})
export class SectionCardHeaderIconDirective { }

@Directive({
  selector: 'hc-card-header-title, [hc-card-header-title], [CardHeaderTitle]',
})
export class SectionCardHeaderTitleDirective { }

@Directive({
  selector: 'hc-card-header-action, [hc-card-header-action], [CardHeaderAction]',
  host: { 'class': 'big-icon' }
})
export class SectionCardHeaderActionDirective { }



@Component({
  selector: 'hc-section-card-header',
  templateUrl: './section-card-header.component.html',
  styleUrls: ['./section-card-header.component.scss']
})
export class SectionCardHeaderComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
