import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from } from 'rxjs'; // Add 'from' here
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AiAssistantService {
  private apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
  private apiKey = environment.geminiApiKey;

  constructor(private http: HttpClient) {}

  generateResponse(prompt: string): Observable<string> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    
    const body = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    };

    return this.http.post(`${this.apiUrl}?key=${this.apiKey}`, body, { headers })
      .pipe(
        map((response: any) => {
          if (response.candidates && response.candidates[0]?.content?.parts[0]?.text) {
            return response.candidates[0].content.parts[0].text;
          }
          return 'Sorry, I couldn\'t generate a response.';
        })
      );
  }
}