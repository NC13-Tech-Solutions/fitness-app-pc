import { NgModule } from '@angular/core';
import { MonthStore } from '../services/ctrl/months.store';
import { SelectionsStore } from '../services/ctrl/selections.store';

@NgModule({
  providers: [MonthStore, SelectionsStore],
})
export class NgrxModule {}
