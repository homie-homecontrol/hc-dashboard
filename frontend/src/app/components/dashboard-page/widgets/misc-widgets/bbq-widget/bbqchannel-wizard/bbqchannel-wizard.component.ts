import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';


export interface CoreTempDonneness {
  rare?: number
  medium?: number
  done?: number
}

export interface MinMax {
  min: number
  max: number
}


export interface CoreTemp {
  [index: string]: {
    [index: string]: CoreTempDonneness
  }
}

export interface BBQTemp {
  [index: string]: MinMax
}

@Component({
  selector: 'hc-bbqchannel-wizard',
  templateUrl: './bbqchannel-wizard.component.html',
  styleUrls: ['./bbqchannel-wizard.component.scss']
})
export class BBQChannelWizardComponent implements OnInit {

  coreTemps = <CoreTemp>{
    "Rind": {
      "Filet": {
        rare: 50,
        medium: 55,
        done: 60
      },
      "Roastbeef": {
        rare: 50,
        medium: 55,
        done: 62
      },
      "Entrecote": {
        rare: 52,
        medium: 56,
        done: 62
      },
      "Beef Brisket": {
        done: 85
      },
      "Tafelspitz": {
        rare: 50,
        medium: 55,
        done: 60
      }
    },
    "Kalb": {
      "Filet": {
        medium: 60
      },
      "Kalbsrücken": {
        medium: 66
      },
      "Schulter": {
        medium: 72,
        done: 75
      },
      "Keule": {
        done: 78
      }
    },
    "Schwein": {
      "Filet": {
        medium: 58,
        done: 65
      },
      "Medallions": {
        medium: 65,
        done: 72
      },
      "Pulled Pork": {
        done: 90
      },
      "Hackbraten": {
        done: 72
      }
    },
    "Lamm": {
      "Keule": {
        medium: 60,
        done: 72,
      },
      "Karree": {
        medium: 58,
        done: 68
      },
      "Filet": {
        medium: 60,
        done: 68
      },
      "Lachse": {
        medium: 60,
        done: 66
      },
      "Schulter": {
        medium: 60,
        done: 68
      }
    },
    "Geflügel": {
      "Hähnchenkeule": {
        done: 81
      },
      "Hähnchenbrust": {
        done: 70
      },
      "Entenbrust": {
        medium: 63,
        done: 70
      },
      "Ente ganz": {
        done: 83
      },
      "Gans": {
        medium: 76,
        done: 90
      },
    }
  }

  bbqTemps = <BBQTemp>{
    "Low n Slow": {
      min: 110,
      max: 130
    },
    "Grillhähnchen": {
      min: 170,
      max: 195
    },
    "Spießbraten": {
      min: 170,
      max: 190
    },
    "Pizza": {
      min: 250,
      max: 350
    }
  }


  measurementType?: 'bbq'|'meat' ;
  animal?: string;
  cut?: string;
  doneness?: string;
  tempSet?: number;

  constructor(public dialogRef: MatDialogRef<BBQChannelWizardComponent, any>,) { }

  setMeasurementType(measurementType: 'bbq'|'meat'){
    this.measurementType=measurementType;
  }

  setAnimal(animal: string){
    this.animal=animal;
  }

  setCut(cut: string){
    this.cut=cut;
  }
  
  setDoneness(doneness: string){
    this.doneness=doneness;
  }

  setBBQTemp(tempSet: number){
    this.tempSet=tempSet;
  }
  
  ngOnInit() {
  }


  closeDialog(save: boolean) {
    if (save && this.measurementType=='bbq' && !!this.tempSet){
      return this.dialogRef.close({
        min: this.bbqTemps[this.tempSet].min,
        max: this.bbqTemps[this.tempSet].max,
        subject: 'bbq'
      });
    }
    if (save && this.measurementType=='meat' && !!this.animal && !!this.cut && !!this.doneness){
      return this.dialogRef.close({
        min: 0,
        max: this.coreTemps[this.animal][this.cut][this.doneness as keyof CoreTempDonneness],
        subject: 'meat'
      });
    }   


    this.dialogRef.close(null);
  }
}
