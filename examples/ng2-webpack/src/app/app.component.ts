import { Component } from '@angular/core';
import {CommentService} from './comment.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  comments = [];
  error: boolean;
  loading: boolean;

  constructor(
    private commentService: CommentService
  ){}

  getComments() {
    this.loading = true;
    this.error = false;

    this.commentService.getComments()
      .subscribe((response) => {
        this.loading = false;
        if (response.status === 200) {
          this.comments = response.json();
          this.error = false;
        }

        if (response.status === 400) {
          this.error = true;
        }

      });
  }
}
