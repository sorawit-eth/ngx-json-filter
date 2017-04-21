import {
  Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild
} from '@angular/core';

import * as _ from 'lodash';
import * as uuid from 'uuid';
import { FilterOutputComponent } from './filter-output/filter-output.component';
import { FilterInputComponent } from './filter-input/filter-input.component';

@Component({
  selector: 'ngx-json-filter',
  templateUrl: './json-filter.component.html',
  styleUrls: ['./json-filter.component.scss']
})
export class JsonFilterComponent<T> implements OnInit, OnChanges {
  @Input() items: Array<T>;
  @Input() searchProperties: string[];
  @Input() titleProperty = 'name';
  @Input() minSearchTermLength = 0;

  @Output() itemSelected: EventEmitter<T> = new EventEmitter<T>();

  @ViewChild(FilterInputComponent) filterInput: FilterInputComponent<T>;
  @ViewChild(FilterOutputComponent) filterOutput: FilterOutputComponent<T>;

  private searchTerm: string;
  public filteredItems: Array<any>;

  constructor() {
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes['items']) {
      return;
    }

    const itemsChanges = changes['items'].currentValue;
    if (itemsChanges) {
      this.items = itemsChanges;

      // if the search properties are not specified, use all object's keys as the search properties.
      if (!this.searchProperties && this.items && this.items.length > 0) {
        this.searchProperties = Object.keys(this.items[0]);
      }

      this.assignItemsUniqueIds();

      // clear the filtered items and filter again with the same search term.
      this.filteredItems = null;
      this.filterItems(this.searchTerm);
    }
  }

  public onSearchTermChanged(searchTerm: string) {
    this.searchTerm = searchTerm;
    this.filterItems(searchTerm);
  }

  public onSearchCanceled(isCanceled: boolean) {
    if (!isCanceled) {
      return;
    }

    this.searchTerm = null;
    this.filteredItems = null;
  }

  public onItemSelected(selectedItem: any) {
    this.itemSelected.emit(this.items.find(item => item['_id'] === selectedItem['_id']));
    this.filteredItems = null;
  }

  public onItemSelectionCanceled(keyCode: number) {
    if (keyCode === 27) { // ESC key
      this.filteredItems = null;
    }

    this.filterInput.focus(keyCode);
  }

  public onListNavigating(keyCode: number) {
    if (keyCode === 27) { // escape key
      this.filteredItems = null;
      return false;
    }

    if (!this.filterOutput) {
      return false;
    }

    this.filterOutput.focus(keyCode);
  }

  /**
   * Assigns a unique ID for each item if not already exists.
   */
  private assignItemsUniqueIds() {
    if (!this.items || this.items.length === 0) {
      return;
    }

    this.items = this.items.map(item => {
      if (item.hasOwnProperty('_id')) {
        return item;
      }

      item['_id'] = uuid.v4();
      return item;
    });
  }

  /**
   * Filters items with the specified search term.
   *
   * @param searchTerm
   */
  private filterItems(searchTerm?: string) {
    if (!searchTerm || !this.items) {
      return;
    }

    this.filteredItems =
        this.items
            .map(item => this.filterItemProperties(item, searchTerm))
            .filter(Boolean);
  }

  /**
   * Filters an item by its properties with the specified search term.
   *
   * @param item
   * @param searchTerm
   * @returns {any}
   */
  private filterItemProperties(item: T, searchTerm: string): any {
    let filteredItem = {};

    this.searchProperties.forEach(propertyKey => {
      if (!item.hasOwnProperty(propertyKey) || !item[propertyKey]) {
        return true;
      }

      let propertyValue = item[propertyKey];
      // TODO: flatten value object if the value is an object.
      // let isObject = propertyValue === Object(propertyValue);
      // let isArray = Object.prototype.toString.call(propertyValue) === '[object Array]';
      // if (isObject && !isArray) {
      //
      // }

      // TODO: check based on the property type (string, number, date, etc.).
      // -- This requires changes in search properties to be more complex e.g. allowing a property type for a property.
      let isMatched = JSON.stringify(propertyValue).toLowerCase().includes(searchTerm.toLowerCase());

      if (isMatched) {
        let value = _.isString(propertyValue) ? propertyValue : this.prettifyJson(propertyValue);
        filteredItem[propertyKey] = this.highlightMatchedTerms(value, searchTerm);
      }
    });

    // Return null if no match.
    if (_.isEmpty(filteredItem)) {
      return null;
    }

    // Add the internal ID property.
    if (item.hasOwnProperty('_id')) {
      filteredItem['_id'] = item['_id'];
    }

    // Add title property if not already added.
    if (!filteredItem.hasOwnProperty(this.titleProperty) && item.hasOwnProperty(this.titleProperty)) {
      let title = _.isString(item[this.titleProperty]) ? item[this.titleProperty] : JSON.stringify(item[this.titleProperty]);
      filteredItem[this.titleProperty] = this.highlightMatchedTerms(title, searchTerm);
    }

    return filteredItem;
  }

  private prettifyJson(json: string) {
    let jsonString = JSON.stringify(json, null, '\t');
    let regExTab = new RegExp('\\t', 'ig');
    let regExComma = new RegExp('",', 'ig');
    let regExOpen = new RegExp('{', 'ig');
    let regExClose = new RegExp('}', 'ig');

    return jsonString
        .replace(regExTab, (match) => {
          return `&nbsp;&nbsp;&nbsp;&nbsp;`;
        })
        .replace(regExComma, (match) => {
          return `",<br/>`;
        })
        .replace(regExOpen, (match) => {
          return `{<br/>`;
        })
        .replace(regExClose, (match) => {
          return `<br/>}`;
        });
  }

  /**
   * Highlights the match terms by wrapping them under a custom HTML.
   *
   * @param text
   * @param term
   * @returns {string}
   */
  private highlightMatchedTerms(text: string, term: string): string {
    let regEx = new RegExp(term, 'ig');

    return text.replace(regEx, (match) => {
      return `<span class="highlight">${match}</span>`;
    });
  }
}
