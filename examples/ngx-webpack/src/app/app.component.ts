import { Component } from '@angular/core';
import { CommentService } from './comment.service';
import { Observable } from 'rxjs/index';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {
  title = 'ngx-webpack';
  comments$: Observable<any>;
  constructor(private commentService: CommentService) {}
  getComments() {
    this.comments$ = this.commentService.getComments();
  }
}
