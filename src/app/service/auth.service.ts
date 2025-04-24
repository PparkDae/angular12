import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient) {}

  register(userId:string, userName: string, password: string, email: string) {
    return this.http.post(`${this.apiUrl}/register`, { userId, userName, password, email });
  }

  login(userId: string, password: string) {
    return this.http.post(`${this.apiUrl}/login`, { userId, password });
  }
}
