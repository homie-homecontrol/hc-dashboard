import { Component, OnInit } from '@angular/core';
import { ScreenSize } from 'angular-web-app-common';
import { map, tap } from 'rxjs/operators';
import { StateService } from 'src/app/services/state.service';

const ColumnsMapping = {
  [ScreenSize.small]: 1,
  [ScreenSize.medium]: 2,
  [ScreenSize.large]: 3
}

export interface Tile {
  color: string;
  cols: number;
  rows: number;
  text: string;
  textlines?: string[];
}

@Component({
  selector: 'hc-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss']
})
export class TestComponent implements OnInit {
  tiles: Tile[] = [
    {text: 'One', cols: 1, rows: 1, color: 'lightblue'},
    {text: 'Two', cols: 1, rows: 2, color: 'lightgreen'},
    {text: 'Three', cols: 1, rows: 4, color: 'lightpink'},
    {text: 'Four', cols: 1, rows: 1, color: '#DDBDF1'},
  ];
  // columns$=this.state.
  // columns$ = this.state.screenSize$.pipe( tap(size => console.log('Size: ', size)), map(size => ColumnsMapping[size]))

  constructor(public state: StateService) { 
    // this.columns$.subscribe(cols => console.log('Columns: ', cols));

  }

  ngOnInit(): void {
  }

  cardClick(tile: Tile){
    console.log('Clicked: ', tile);


    tile.textlines=[  
    ]

    for (let index = 0; index < 100; index++) {
      tile.textlines.push(`Line number ${index+1} `);      
    }
  }

}
