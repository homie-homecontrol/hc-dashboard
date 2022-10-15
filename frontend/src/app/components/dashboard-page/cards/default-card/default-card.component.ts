import { Component, OnInit } from '@angular/core';
import { DefaultCard } from 'src/app/models/dash.model';
import { CardBaseComponent } from '../card-base.control';

@Component({
  selector: 'hc-default-card',
  templateUrl: './default-card.component.html',
  styleUrls: ['./default-card.component.scss']
})
export class DefaultCardComponent extends CardBaseComponent<DefaultCard> implements OnInit {

  ngOnInit(): void {
  }

}
