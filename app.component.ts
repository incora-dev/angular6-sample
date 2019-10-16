import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { ProductHttpService } from '../../services/productHttp.service';
import { AuthenticationProvider } from '../../../../global/contracts/services/authentication.provider';
import { ProductContract, PRODUCTS_PROVIDER } from '../../../../global/contracts/modules/products.contract';
import { BehaviorSubject, forkJoin, Subscription } from 'rxjs';
import { MessageService } from '../../../../core/fk-forms/services/message.service';
import { ComponentStates, EventStates } from '../../../../global/contracts/types/component-states';
import { Router } from '@angular/router';
import { CategoryContract } from '../../../../global/contracts/modules/category.contract';
import { SecuredStorageProvider } from '../../../../modules/security/services/secured-storage.provider';
import { ProductBridge } from '../../models/product.model';


@Component({
  selector: 'app-product-list',
  templateUrl: './app.component.html',
  styleUrls: []
})
export class ProductListComponent implements OnInit, OnDestroy {
  public products: ProductBridge[] = [];
  public productFilterText = '';
  public deleteProduct = false;
  public isLoading: boolean = true;
  public eventProduct: ProductContract;
  public shopCategories: CategoryContract[] = [];
  public eventState = new BehaviorSubject<EventStates>({ newState: ComponentStates.init, id: 0, value: '' });
  productsSubscription: Subscription;
  constructor(
    @Inject(PRODUCTS_PROVIDER) private service: ProductHttpService,
    private authService: AuthenticationProvider,
    private _messageService: MessageService,
    private _router: Router,
    private storageProvider: SecuredStorageProvider,
  ) { }

  ngOnInit() {
    this.getShopProducts();
    const authUser = this.authService.getAuthUser();
    const shop = this.storageProvider.getShop();
  }

  ngOnDestroy() {
    if (this.productsSubscription) {
      this.productsSubscription.unsubscribe();
    }
  }

  public getShopProducts(): void {
    const shopId = this.authService.getAuthProfile().getShopId();
    const shop = this.storageProvider.getShop();
    if (shop !== null) {
      this.shopCategories = shop.shopCategories;
    }
    this.isLoading = true;
    if (this.productsSubscription === undefined) {
      this.productsSubscription = this.service.getPrivateProductsForShopId(shopId).subscribe(
        (data) => {
          this.products = data;
          this.isLoading = false;
        });
    }
  }

  public swap(event: ProductContract[]) {
    const requests = [];
    event.forEach(
      product =>
        requests.push(this.service.saveProductOrder(
          product.productID, product.productOrder, product.title, product.description))
    );
    forkJoin(requests).subscribe(
      data => this.postSwap(data),
      error => this.postSwap(error)
    );
  }
  private postSwap(data?) {
    if (this._router.url === '/sellers/products') {
      this._messageService.sendSuccessMessage('Products reordered', '');
    }
  }
  public showDelete(event: ProductContract) {
    this.deleteProduct = true;
    this.eventProduct = event;
  }
  public showEdit(event: ProductContract) {
    this._router.navigate(['/sellers/products/product', event.productID]);
  }
  public delete(button) {
    button.disabled = true;
    const oldId = this.eventProduct.productID + 0;
    this.service.deleteProduct(this.eventProduct.productID).subscribe(
      (result) => {
        this._messageService.sendSuccessMessage('Product Deleted', '');
        this.deleteProduct = false;
        this.updateState(ComponentStates.deleted, oldId, result);
        this.eventProduct = undefined;
        button.disabled = false;
      },
      ({ error }) => {
        button.disabled = false;
        error = JSON.parse(error);
        let responseError;
        if (error.errors) {
          responseError = error.errors;
        } else {
          responseError = error.message;
        }
        if (responseError instanceof Object) {
          const erorsArrays: Array<Array<string>> = Object.values(responseError);
          const errorMessage: string = erorsArrays
            .reduce((prev: Array<string>, current: Array<string>) => prev.concat(current)).join('<br>');
          this._messageService.sendErrorMessage('Can not delete product', errorMessage);
        } else {
          this._messageService.sendErrorMessage('Can not delete product', responseError);
        }
      });
  }
  updateState(state: ComponentStates, id: number, val: string) {
    this.eventState.next({ newState: state, id, value: val });
  }
  update() {
    this.updateState(ComponentStates.filtered, 0, this.productFilterText);
  }
}
