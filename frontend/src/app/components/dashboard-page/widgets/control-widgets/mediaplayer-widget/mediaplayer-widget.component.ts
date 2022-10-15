import { Component, OnInit } from '@angular/core';
import { interval, map, of, switchMap } from 'rxjs';
import { MediaPlayerWidget } from 'src/app/models/dash.model';
import { WidgetBaseComponent } from '../../widget-base.control';

@Component({
  selector: 'hc-mediaplayer-widget',
  templateUrl: './mediaplayer-widget.component.html',
  styleUrls: ['./mediaplayer-widget.component.scss']
})
export class MediaplayerWidgetComponent extends WidgetBaseComponent<MediaPlayerWidget> implements OnInit {

  playState$ = this.state.properties.makePropertValueStream(this.widget.mappings?.playState)
  playAction$ = this.state.properties.makePropertValueStream(this.widget.mappings?.playAction)
  title$ = this.state.properties.makePropertValueStream(this.widget.mappings?.title)
  subText1$ = this.state.properties.makePropertValueStream(this.widget.mappings?.subText1)
  subText2$ = this.state.properties.makePropertValueStream(this.widget.mappings?.subText2)
  shuffle$ = this.state.properties.makePropertValueStream(this.widget.mappings?.shuffle);
  volume$ = this.state.properties.makePropertValueStream(this.widget.mappings?.volume).pipe(
    map(value => parseFloat(value))
  )
  imageUrl$ = this.state.properties.makePropertValueStream(this.widget.mappings?.imageUrl)

  position$ = this.state.properties.makePropertValueStream(this.widget.mappings?.position).pipe(
    map(value => parseInt(value)),
    // switchMap(position => this.playState$.pipe(
    //   switchMap(playState => {
    //     if (playState === 'playing') {

    //       return interval(1000).pipe(
    //         map(index => position + index)
    //       );
    //     } else {
    //       return of(position);
    //     }
    //   })
    // ))
  )

  duration$ = this.state.properties.makePropertValueStream(this.widget.mappings?.duration).pipe(
    map(value => parseInt(value))
  )

  mute$ = this.state.properties.makePropertValueStream(this.widget.mappings?.mute);
  repeat$ = this.state.properties.makePropertValueStream(this.widget.mappings?.repeat);


  ngOnInit(): void {
    console.log('Mediaplayer', this.widget);
  }

  previous() {
    this.api.setProperty(this.widget.mappings?.playAction, 'previous').subscribe();
  }

  playPause(playstate: string) {
    this.api.setProperty(this.widget.mappings?.playAction, playstate === 'playing' ? 'pause' : 'play').subscribe();
  }

  next() {
    this.api.setProperty(this.widget.mappings?.playAction, 'next').subscribe();
  }


  toggleShuffle(shuffle: 'disabled' | 'on' | 'off') {

    if (shuffle === 'on') {
      this.api.setProperty(this.widget.mappings?.shuffle, 'off').subscribe();
    } else if (shuffle === 'off') {
      this.api.setProperty(this.widget.mappings?.shuffle, 'on').subscribe();
    }
  }

  toggleRepeat(repeat: 'disabled' | 'on' | 'off') {

    if (repeat === 'on') {
      this.api.setProperty(this.widget.mappings?.repeat, 'off').subscribe();
    } else if (repeat === 'off') {
      this.api.setProperty(this.widget.mappings?.repeat, 'on').subscribe();
    }
  }

  toggleMute(mute: 'disabled' | 'on' | 'off') {

    if (mute === 'on') {
      this.api.setProperty(this.widget.mappings?.mute, 'off').subscribe();
    } else if (mute === 'off') {
      this.api.setProperty(this.widget.mappings?.mute, 'on').subscribe();
    }
  }

  setVolume(volume: number) {
    this.api.setProperty(this.widget.mappings?.volume, volume).subscribe();

  }


}
