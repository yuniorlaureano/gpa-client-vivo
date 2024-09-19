import { Component, OnDestroy, OnInit } from '@angular/core';
import { LayoutService } from '../service/layout.service';
import { FilterModel } from '../models/filter.model';
import { LoadReasons } from '../ng-xs-store/actions/app.actions';
import { processError } from '../utils/error.utils';
import { ReasonService } from '../../inventory/service/reason.service';
import { Store } from '@ngxs/store';
import { ErrorService } from '../service/error.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'gpa-admin-template',
  templateUrl: './admin-template.component.html',
  styleUrl: './admin-template.component.css',
})
export class AdminTemplateComponent implements OnInit, OnDestroy {
  subscriptions$: Subscription[] = [];

  constructor(
    public layoutService: LayoutService,
    public store: Store,
    private reasonService: ReasonService,
    private errorService: ErrorService
  ) {}

  ngOnDestroy(): void {
    this.subscriptions$.forEach((sub) => sub.unsubscribe());
  }

  ngOnInit(): void {
    this.loadReasons();
  }

  loadReasons() {
    const filter = new FilterModel();
    filter.pageSize = 100;
    const sub = this.reasonService.getReasons(filter).subscribe({
      next: (reasons) => {
        this.store.dispatch(new LoadReasons(reasons.data));
      },
      error: (error) => {
        processError(error.error || error, 'Error cargando motivos').forEach(
          (err) => {
            this.errorService.addGeneralError(err);
          }
        );
      },
    });
    this.subscriptions$.push(sub);
  }
}
