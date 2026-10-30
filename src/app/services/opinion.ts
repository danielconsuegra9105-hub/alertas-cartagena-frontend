import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OpinionPublica } from '../models/alerta.model';

@Injectable({
  providedIn: 'root'
})
export class OpinionService {
  private apiUrl = 'http://localhost:8080/api/opiniones';

  constructor(private http: HttpClient) { }

  crear(opinion: OpinionPublica): Observable<OpinionPublica> {
    return this.http.post<OpinionPublica>(this.apiUrl, opinion);
  }
}