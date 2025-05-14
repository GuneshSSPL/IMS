import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterOutlet, NavigationEnd } from '@angular/router';
import { HeaderComponent } from './MyComponent/header/header.component';
import { SidebarComponent } from './MyComponent/sidebar/sidebar.component';
// import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HeaderComponent,SidebarComponent,CommonModule, RouterOutlet, RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  showHeader = false;
  currentUser = 'Test User';

  constructor(private router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.showHeader = !['/', '/login','/signup'].includes(event.url);
      }
    });
  }

  logout() {
    this.currentUser = '';
    this.router.navigate(['/']);
  }
}


