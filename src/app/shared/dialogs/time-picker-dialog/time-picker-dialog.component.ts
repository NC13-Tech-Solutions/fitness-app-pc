import { AfterViewInit, Component, Inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSliderModule } from '@angular/material/slider';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
    selector: 'app-time-picker-dialog',
    imports: [
        MatDialogModule,
        ReactiveFormsModule,
        MatSliderModule,
        MatRadioModule,
        MatButtonModule,
        MatIconModule,
    ],
    templateUrl: './time-picker-dialog.component.html',
    styleUrl: './time-picker-dialog.component.sass'
})
export class TimePickerDialogComponent implements AfterViewInit {
  constructor(
    public dialogRef: MatDialogRef<TimePickerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: string
  ) {}

  formGroup = new FormGroup({
    hours: new FormControl<number>(12, {
      validators: [Validators.min(1), Validators.max(12), Validators.required],
    }),
    minutes: new FormControl<number>(0, {
      validators: [Validators.min(0), Validators.max(59), Validators.required],
    }),
    amOrPM: new FormControl<string>('AM', {
      nonNullable: true,
      validators: [Validators.pattern('^([AP][M])$'), Validators.required],
    }),
  });

  ngAfterViewInit(): void {
    if (this.data != '') {
      let x = this.data.split(' '); // '12:00 AM' will be split into '12:00' and 'AM'
      let y = x[0].split(':'); //'12:00' will be split into '12' and '00'

      let h = parseInt(y[0]);
      let m = parseInt(y[1]);

      this.formGroup.reset({ hours: h, minutes: m, amOrPM: x[1] });
    }
  }

  // Getters for formGroup
  get Hours() {
    return this.formGroup.get('hours');
  }
  get Minutes() {
    return this.formGroup.get('minutes');
  }
  get AmOrPM() {
    return this.formGroup.get('amOrPM');
  }

  get HoursValue() {
    let h = this.Hours?.value ?? 0;
    if (h > 9) {
      return h;
    }
    return `0${h}`;
  }
  get MinutesValue() {
    let m = this.Minutes?.value ?? 0;
    if (m > 9) {
      return m;
    }
    return `0${m}`;
  }
  get AmOrPMValue() {
    return this.AmOrPM?.value ?? 'AM';
  }

  close(arg0: boolean, passedInfo: string) {
    this.dialogRef.close({ data: passedInfo, submit: arg0 });
  }

  submit() {
    if (this.formGroup.valid) {
      let h = this.Hours?.value;
      let m = this.Minutes?.value;
      let ap = this.AmOrPM?.value;
      if (
        h != undefined &&
        h != null &&
        m != undefined &&
        m != null &&
        ap != undefined &&
        ap != null
      ) {
        let hString = h > 9 ? `${h}` : `0${h}`;
        let mString = m > 9 ? `${m}` : `0${m}`;
        this.close(true, `${hString}:${mString} ${ap}`);
      }
    }
  }
  resetForm() {
    this.formGroup.reset({ hours: 12, minutes: 0, amOrPM: 'AM' });
  }

  currentTime(){
    const date = new Date();
    let hours = date.getHours();
    const minutes = date.getMinutes();
    let amOrPM = 'AM';
    if(hours == 0){
      hours = 12;
    } else if(hours > 12){
      hours -= 12;
     amOrPM = 'PM';
    }
    this.formGroup.reset({hours,minutes,amOrPM});
  }
}
