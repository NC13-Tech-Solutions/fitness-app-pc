import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { monthsReducer } from '../services/ctrl/months.reducer';
import { exerciseSelectionsReducer } from '../services/ctrl/exercise-selections.reducer';

@NgModule({
  imports: [
    StoreModule.forRoot({
      months: monthsReducer,
      exerciseSelections: exerciseSelectionsReducer,
    }),
  ],
})
export class NgrxModule {}
