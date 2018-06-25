import 'rxjs/add/operator/toPromise';
import { Injectable } from '@angular/core';
import { CONFIG } from '../config/config';
import { Http } from '@angular/http';
import { Router} from '@angular/router';
import {UserData} from '../classes/UserData';
import {NotifyService} from './notify.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private http: Http,
    private router: Router,
    private notifyService: NotifyService,
  ) {

  }

  getAuthUser() {
    return JSON.parse(localStorage.getItem('user'));
  }

  getAuthUserId() {
    return JSON.parse(localStorage.getItem('user')).id;
  }

  getToken(): string {
    return localStorage.getItem('token');
  }

  register(name: string, email: string, password: string): Promise<UserData> {
    return this.http.post(`${CONFIG.API_URL}/register`, { name: name, email: email, password: password })
      .toPromise()
      .then((response) => {
        const token = response.json().token;
        const user = response.json().user.data;
        return new UserData(token, user);
        // return userData;
      })
      .catch(error => {
        return Promise.reject(error.json());
      });
  }

  login(email: string, password: string): Promise<UserData> {
    return this.http.post(`${CONFIG.API_URL}/authenticate`,
      { username: email, password: password })
      .toPromise()
      .then((response) => {
        console.log(response.json());
        const token = response.json().auth;
        const user = response.json().user.data;
        // const
        return new UserData(token, user);

        // return userData;
      })
      .catch(error => {
        return Promise.reject(error.json());
      });

  }

  logUserIn(userData: UserData): void {
    localStorage.setItem('token', userData.token.access_token);

    localStorage.setItem('user', JSON.stringify(userData.user));

    this.notifyService.notify('Successfully logged in.', 'success');

    this.router.navigate(['dashboard']);
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    const user =  localStorage.getItem('user');

    // user is authenticated
    if ( token && user ) {
      return true;
    }
    // not authenticated
    return false;
  }

  logout() {

    localStorage.removeItem('token');
    localStorage.removeItem('user');

    this.router.navigate(['auth/login']);
  }
}