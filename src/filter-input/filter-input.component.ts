import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import 'rxjs/Rx';

import * as _ from 'lodash';

@Component({
  selector: 'ngx-filter-input',
  templateUrl: './filter-input.component.html',
  styleUrls: ['./filter-input.component.scss']
})
export class FilterInputComponent<T> implements OnInit {
  @Input() minSearchTermLength = 0;

  @Output() searchCanceled: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() searchTermChanged: EventEmitter<string> = new EventEmitter<string>();
  @Output() listNavigating: EventEmitter<number> = new EventEmitter<number>();

  @ViewChild('searchTerm') searchTermInput: ElementRef;

  public formGroup: FormGroup;

  /**
   * The class constructor.
   *
   * @param formBuilder
   */
  constructor(private formBuilder: FormBuilder) {
  }

  /**
   * Angular 2 OnInit lifecycle hook.
   */
  ngOnInit() {
    this.formGroup = this.formBuilder.group({
      searchTerm: ''
    });

    // Monitor the search term for changes and handle accordingly.
    this.formGroup.controls['searchTerm'].valueChanges
      .debounceTime(500)
      .distinctUntilChanged()
      .subscribe(value => this.handleSearchTermChanged(value));
  }

  public focus(keyCode: number) {
    let inputElement = this.searchTermInput.nativeElement;

    // Currently, the input element is focused upon ESC keydown only.
    // TODO: apply pressed key to the input element.
    if (keyCode === 27) {
      inputElement.focus();
    }
  }

  /**
   * Handles form submission event.
   *
   * @param event
   * @param form
   */
  public onFormSubmit(event, form: any) {
    this.handleSearchTermChanged(form.searchTerm);
  }

  public onKeyDown(event) {
    let allowedKeyCodes = [38, 40, 27];
    if (_.includes(allowedKeyCodes, event.keyCode)) {
      this.listNavigating.emit(event.keyCode);
      return false;
    }
  }

  /**
   * Handles the search-term change event.
   *
   * @param value
   */
  private handleSearchTermChanged(value) {
    if (!value || value.length < this.minSearchTermLength) {
      this.searchCanceled.emit(true);
      return;
    }

    this.searchTermChanged.emit(value);
  }
}
