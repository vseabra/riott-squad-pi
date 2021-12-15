import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Lists } from 'src/models/lists.model';
import { List } from 'src/models/list.model';
import { CrudService } from './crud.service';
import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ListService extends CrudService<Lists, List> {

  constructor(protected http: HttpClient) {
    super(http);
  }

  markAsMissed(apiUrl: string, body: { isMissed: boolean }) {
    return this.http.patch<List>(apiUrl, body, { headers: this.headers })
      .pipe(take(2));
  }
}