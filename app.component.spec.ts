import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductListComponent } from './app.component';
import { MocksModule } from '../../../../mocks/mocks.module';
import { ProductSearchPipe } from '../../pipes/product-search.pipe';
import { KendoSortableProductsComponent } from '../kendo-sortable-products/kendo-sortable-products.component';
import { MessageService } from '../../../../core/fk-forms/services/message.service';
import { SortableModule } from '../../../../../../node_modules/@progress/kendo-angular-sortable';
import { PRODUCTS_PROVIDER } from '../../../../global/contracts/modules/products.contract';
import { ProductProviderMock } from '../../mocks/ProductProviderMock';
import { DeviceDetectorService } from 'ngx-device-detector';

describe('ProductListComponent', () => {
  let component: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MocksModule,
        SortableModule
      ],
      declarations: [
        ProductListComponent,
        ProductSearchPipe,
        KendoSortableProductsComponent
      ],
      providers: [
        {
          provide: PRODUCTS_PROVIDER,
          useClass: ProductProviderMock
        },
        MessageService,
        DeviceDetectorService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
