import { Component, Directive, OnInit } from '@angular/core';

@Directive({
  selector: 'hc-card-content, [hc-card-content], [CardContent]',
})
export class SectionCardContentDirective { }



@Component({
  selector: 'hc-section-card',
  templateUrl: './section-card.component.html',
  styleUrls: ['./section-card.component.scss']
})
export class SectionCardComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
