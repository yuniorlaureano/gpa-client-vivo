import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'gpa-modal',
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css',
})
export class ModalComponent implements OnInit {
  @Input() title!: string;
  @Input() html!: string;
  @Input() okText: string = 'OK';
  @Input() cancelText: string = 'Cancel';
  safeHtmlContent!: SafeHtml;

  constructor(public modal: NgbActiveModal, private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.safeHtmlContent = this.sanitizer.bypassSecurityTrustHtml(this.html);
  }

  confim(): void {
    this.modal.close();
  }

  dismiss(): void {
    this.modal.dismiss();
  }
}
