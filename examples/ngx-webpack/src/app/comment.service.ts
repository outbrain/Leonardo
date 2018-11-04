import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import {Observable} from 'rxjs/Rx';
import { map } from 'rxjs/operators';

@Injectable()
export class CommentService {
  constructor(private http: Http) {}

  private commentsUrl = '/api/comments';

  getComments() : Observable<Response> {
    return this.http
    .get(this.commentsUrl)
    .pipe(
      map((response) => response.json())
    )
  }
}
