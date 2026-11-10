import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OpinionPublica } from '../models/alerta.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OpinionService {
  private apiUrl = `${environment.apiUrl}/opiniones`;

  constructor(private http: HttpClient) { }

  crear(opinion: OpinionPublica): Observable<OpinionPublica> {
    return this.http.post<OpinionPublica>(this.apiUrl, opinion);
  }
}