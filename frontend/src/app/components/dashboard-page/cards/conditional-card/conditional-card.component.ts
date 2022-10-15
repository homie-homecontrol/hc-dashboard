import { Component, OnInit } from '@angular/core';
import { evaluateValueCondition } from 'node-homie/util';
import { map } from 'rxjs/operators';
import { ConditionalCard } from 'src/app/models/dash.model';
import { CardBaseComponent } from '../card-base.control';

@Component({
  selector: 'hc-conditional-card',
  templateUrl: './conditional-card.component.html',
  styleUrls: ['./conditional-card.component.scss']
})
export class ConditionalCardComponent extends CardBaseComponent<ConditionalCard> implements OnInit {


  condition$ = this.state.properties.makePropertValueStream(this.card.config?.property).pipe(
    map(value => evaluateValueCondition(value, this.card.config?.condition))
  )

  ngOnInit(): void {
  }

}
