import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { tap } from 'rxjs/operators';
import { Product } from '../models/product';
import { ProductService } from '../service/product.service';
import {
  AddProduct,
  DeleteProduct,
  GetProducts,
  SetSelectedProduct,
  UpdateProduct,
} from '../actions/product.action';

export class ProductStateModel {
  products!: Product[];
  selectedProduct!: Product;
}

@State<ProductStateModel>({
  name: 'products',
  defaults: {
    products: [],
    selectedProduct: null!,
  },
})
@Injectable()
export class ProductState {
  constructor(private productService: ProductService) {}

  @Selector()
  static getProductList(state: ProductStateModel) {
    return state.products;
  }

  @Selector()
  static getSelectedProduct(state: ProductStateModel) {
    return state.selectedProduct;
  }

  @Action(GetProducts)
  getProducts({ getState, setState }: StateContext<ProductStateModel>) {
    return this.productService.fetchProducts().pipe(
      tap((result) => {
        const state = getState();
        setState({
          ...state,
          products: result,
        });
      })
    );
  }

  @Action(AddProduct)
  addProduct(
    { getState, patchState }: StateContext<ProductStateModel>,
    { payload }: AddProduct
  ) {
    return this.productService.addProduct(payload).pipe(
      tap((result) => {
        const state = getState();
        patchState({
          products: [...state.products, result],
        });
      })
    );
  }

  @Action(UpdateProduct)
  updateProduct(
    { getState, setState }: StateContext<ProductStateModel>,
    { payload, id }: UpdateProduct
  ) {
    return this.productService.updateProduct(payload, id).pipe(
      tap((result) => {
        const state = getState();
        const productList = [...state.products];
        const productIndex = productList.findIndex((item) => item.id === id);
        productList[productIndex] = result;
        setState({
          ...state,
          products: productList,
        });
      })
    );
  }

  @Action(DeleteProduct)
  deleteProduct(
    { getState, setState }: StateContext<ProductStateModel>,
    { id }: DeleteProduct
  ) {
    return this.productService.deleteProduct(id).pipe(
      tap(() => {
        const state = getState();
        const filteredArray = state.products.filter((item) => item.id !== id);
        setState({
          ...state,
          products: filteredArray,
        });
      })
    );
  }

  @Action(SetSelectedProduct)
  setSelectedProductId(
    { getState, setState }: StateContext<ProductStateModel>,
    { payload }: SetSelectedProduct
  ) {
    const state = getState();
    setState({
      ...state,
      selectedProduct: payload,
    });
  }
}
