import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { authentication } from './core/auth-guard.service';
import { EmptyComponent } from './components/empty/empty.component';
import { MainComponent } from './components/main/main.component';
import { ExercisesComponent } from './components/exercises/exercises.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [authentication] },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'main', component: MainComponent, canActivate: [authentication] },
  { path: 'exercises', component: ExercisesComponent, canActivate: [authentication] },
  { path: '**', component: EmptyComponent, canActivate: [authentication] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
