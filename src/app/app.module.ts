import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoginComponent } from './components/login/login.component';
import { LocationStrategy, HashLocationStrategy, DatePipe } from '@angular/common';
import { EmptyComponent } from './components/empty/empty.component';
import { MaterialModule } from './core/material.module';
import { MainComponent } from './components/main/main.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgrxModule } from './core/ngrx.module';
import { DayCardComponent } from './components/day-card/day-card.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ViewExercisesComponent } from './components/view-exercises/view-exercises.component';
import { ExercisesComponent } from './components/exercises/exercises.component';
import { AddOrEditExerciseComponent } from './components/add-or-edit-exercise/add-or-edit-exercise.component';
import { EditDialogComponent } from './shared/dialogs/edit-dialog/edit-dialog.component';
import { ViewDayComponent } from './components/view-day/view-day.component';
import { ViewWorkoutComponent } from './components/view-workout/view-workout.component';
import { ViewWorkoutExercisesComponent } from './components/view-workout-exercises/view-workout-exercises.component';
import { AddOrEditDayComponent } from './components/add-or-edit-day/add-or-edit-day.component';
import { AddOrEditWorkoutComponent } from './components/add-or-edit-workout/add-or-edit-workout.component';
import { WorkoutExerciseFormComponent } from './components/workout-exercise-form/workout-exercise-form.component';
import { AddExerciseDialogComponent } from './shared/dialogs/add-exercise-dialog/add-exercise-dialog.component';
import { StoreModule } from '@ngrx/store';

@NgModule({ declarations: [
        AppComponent,
        LoginComponent,
        EmptyComponent,
        MainComponent,
        DayCardComponent,
        ViewExercisesComponent,
        ExercisesComponent,
        AddOrEditExerciseComponent,
        EditDialogComponent,
        ViewDayComponent,
        ViewWorkoutComponent,
        ViewWorkoutExercisesComponent,
        AddOrEditDayComponent,
        AddOrEditWorkoutComponent,
        WorkoutExerciseFormComponent,
        AddExerciseDialogComponent
    ],
    bootstrap: [AppComponent], imports: [BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        MaterialModule,
        FormsModule,
        ReactiveFormsModule,
        NgrxModule,
        StoreModule.forRoot({}, {})], providers: [
        { provide: LocationStrategy, useClass: HashLocationStrategy },
        DatePipe,
        provideHttpClient(withInterceptorsFromDi())
    ] })
export class AppModule { }
