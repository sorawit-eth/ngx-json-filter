import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { JsonFilterComponent } from './json-filter.component';
import { FilterInputComponent } from './filter-input/filter-input.component';
import { FilterOutputComponent } from './filter-output/filter-output.component';

export * from './json-filter.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    JsonFilterComponent,
    FilterInputComponent,
    FilterOutputComponent
  ],
  exports: [
    JsonFilterComponent
  ]
})
export class JsonFilterModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: JsonFilterModule,
      providers: []
    };
  }
}
