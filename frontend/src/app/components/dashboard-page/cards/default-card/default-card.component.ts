import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { DefaultCard, Widget } from 'src/app/models/dash.model';
import { CardBaseComponent } from '../card-base.control';
import { evaluateValueCondition } from 'node-homie/util';
import { Observable, of, map } from 'rxjs';

@Component({
  selector: 'hc-default-card',
  templateUrl: './default-card.component.html',
  styleUrls: ['./default-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DefaultCardComponent extends CardBaseComponent<DefaultCard> implements OnInit {

  ngOnInit(): void {
  }

}
