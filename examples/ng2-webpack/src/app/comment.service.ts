import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import {Observable} from 'rxjs/Rx';

@Injectable()
export class CommentService {
  constructor(private http: Http) {}

  private commentsUrl = 'http://localhost:3000/api/comments';

  getComments() : Observable<Response> {
    return this.http.get(this.commentsUrl);
  }
}
