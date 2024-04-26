import { Component, OnInit } from '@angular/core';

declare let jQuery: any;

@Component({
  selector: 'gpa-admin-sidebar',
  templateUrl: './admin-sidebar.component.html',
  styleUrl: './admin-sidebar.component.css',
})
export class AdminSidebarComponent implements OnInit {
  ngOnInit(): void {
    jQuery('.sidebarMenuScroll').overlayScrollbars({
      scrollbars: {
        visibility: 'auto',
        autoHide: 'scroll',
        autoHideDelay: 200,
        dragScrolling: true,
        clickScrolling: false,
        touchSupport: true,
        snapHandle: false,
      },
    });
  }
}
