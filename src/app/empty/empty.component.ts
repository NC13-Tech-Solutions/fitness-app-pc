import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-empty',
  templateUrl: './empty.component.html',
  styleUrls: ['./empty.component.sass']
})
export class EmptyComponent {

  constructor(private router: Router){}

  btnClick(){
    this.router.navigateByUrl('/login');
  }

}
