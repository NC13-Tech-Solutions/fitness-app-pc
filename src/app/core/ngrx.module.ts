import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { monthsReducer } from '../services/ctrl/months.reducer';



@NgModule({
  imports:[
    StoreModule.forRoot({months: monthsReducer})
  ]
})
export class NgrxModule { }
