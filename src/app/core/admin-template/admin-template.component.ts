import { Component, OnInit } from '@angular/core';
import { LayoutService } from '../services/layout.service';
declare let jQuery: any;

@Component({
  selector: 'gpa-admin-template',
  templateUrl: './admin-template.component.html',
  styleUrl: './admin-template.component.css',
})
export class AdminTemplateComponent implements OnInit {
  constructor(public layoutService: LayoutService) {}
  ngOnInit(): void {}
}
