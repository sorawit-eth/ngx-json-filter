import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';

import * as _ from 'lodash';

/**
 * This component simply displays the items injected via the Input(items).
 * It does not do any filtering.
 * However, '_id' property is not displayed unless explicitly specified via the Input(displayProperties).
 */
@Component({
  selector: 'ngx-filter-output',
  templateUrl: './filter-output.component.html',
  styleUrls: ['./filter-output.component.scss']
})
export class FilterOutputComponent<T> implements OnInit {
  @Input() items: Array<T>;
  @Input() titleProperty = 'name';
  @Input() displayProperties: string[];

  @Output() itemSelected: EventEmitter<T> = new EventEmitter<T>();
  @Output() itemSelectionCanceled: EventEmitter<number> = new EventEmitter<number>();

  @ViewChild('itemList') itemList: ElementRef;

  constructor() {
  }

  ngOnInit() {
  }

  public focus(keyCode: number) {
    if (!this.itemList) {
      return;
    }

    this.setActiveItem(keyCode);
  }

  public onItemSelected(event, item: any) {
    event.stopPropagation();

    this.itemSelected.emit(item);
  }

  public onKeyDown(event) {
    event.preventDefault();

    this.setActiveItem(event.keyCode);
  }

  public onItemKeyDown(event, item: any) {
    event.preventDefault();

    if (event.keyCode !== 13) {
      return false;
    }

    this.itemSelected.emit(item);
  }

  private setActiveItem(keyCode: number) {
    let allowedKeyCodes = [38, 40];
    if (!_.includes(allowedKeyCodes, keyCode)) {
      // If not UP/DOWN arrow key, emit the key code to the parent component to let it handle what to do with the key.
      this.itemSelectionCanceled.emit(keyCode);
      return;
    }

    let targetItem;
    switch (keyCode) {
      case 38: // UP arrow key
        targetItem = this.getPreviousItemSibling();
        break;
      case 40: // DOWN arrow key
        targetItem = this.getNextItemSibling();
        break;
      default:
        break;
    }

    if (!targetItem) {
      return;
    }

    let itemListElement = this.itemList.nativeElement;
    itemListElement.querySelectorAll('.item').forEach(el => el.classList.remove('active'));
    targetItem.focus();
    targetItem.classList.add('active');
  }

  private getNextItemSibling() {
    return this.getTargetItemSibling(true);
  }

  private getPreviousItemSibling() {
    return this.getTargetItemSibling(false);
  }

  private getTargetItemSibling(isNext: boolean) {
    let itemListElement = this.itemList.nativeElement;
    let items = Array.from(itemListElement.querySelectorAll('.item'));
    let activeItem = items.find((item: HTMLElement) => item.classList.contains('active'));
    let activeItemIndex = items.indexOf(activeItem);

    if (activeItem) {
      return isNext ? items[activeItemIndex + 1] || items[0] : items[activeItemIndex - 1] || items[items.length - 1];
    }

    return isNext ? items[0] : items[items.length - 1];
  }

  /**
   * Gets properties for displaying.
   * If not specified via Input, all properties except '_id' should be displayed.
   *
   * @param item
   * @returns {any}
   */
  private getDisplayProperties(item: T): string[] {
    if (this.displayProperties) {
      return this.displayProperties;
    }

    if (!item) {
      return [];
    }

    return Object.keys(item).filter(key => key !== '_id' && key !== this.titleProperty);
  }

  /**
   * Gets the item title.
   *
   * @param item
   * @returns {any}
   */
  private getItemTitle(item: T) {
    if (!item || !item.hasOwnProperty(this.titleProperty)) {
      return 'N/A';
    }

    return item[this.titleProperty];
  }

  /**
   * GEts the item value.
   *
   * @param item
   * @param propertyName
   * @returns {any}
   */
  private getDisplayValue(item: T, propertyName: string) {
    return item[propertyName];
  }
}
