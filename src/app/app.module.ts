import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoginComponent } from './login/login.component';
import { LocationStrategy, HashLocationStrategy, DatePipe } from '@angular/common';
import { EmptyComponent } from './empty/empty.component';
import { MaterialModule } from './core/material.module';
import { MainComponent } from './main/main.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgrxModule } from './core/ngrx.module';
import { DayCardComponent } from './day-card/day-card.component';
import { HttpClientModule } from '@angular/common/http';
import { ViewExercisesComponent } from './view-exercises/view-exercises.component';
import { ExercisesComponent } from './exercises/exercises.component';
import { AddOrEditExerciseComponent } from './add-or-edit-exercise/add-or-edit-exercise.component';
import { EditDialogComponent } from './shared/dialogs/edit-dialog/edit-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    EmptyComponent,
    MainComponent,
    DayCardComponent,
    ViewExercisesComponent,
    ExercisesComponent,
    AddOrEditExerciseComponent,
    EditDialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    NgrxModule,
    HttpClientModule
  ],
  providers: [
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    DatePipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
