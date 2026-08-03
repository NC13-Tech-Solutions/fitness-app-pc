import { NgModule } from '@angular/core';
import { MonthStore } from 'app/services/ctrl/months.store';
import { SelectionsStore } from 'app/services/ctrl/selections.store';

@NgModule({
  providers: [MonthStore, SelectionsStore],
})
export class NgrxModule {}
