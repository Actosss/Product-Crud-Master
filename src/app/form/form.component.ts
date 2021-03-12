import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { Product } from '../models/product';
import {
  AddProduct,
  SetSelectedProduct,
  UpdateProduct,
} from '../actions/product.action';
import { ProductState } from '../states/product.state';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css'],
})
export class FormComponent implements OnInit {
  @Select(ProductState.getSelectedProduct)
  selectedProduct!: Observable<Product>;
  productForm!: FormGroup;
  editProduct = false;
  private formSubscription: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.createForm();
  }

  ngOnInit() {
    this.formSubscription.add(
      this.selectedProduct.subscribe((product) => {
        if (product) {
          this.productForm.patchValue({
            id: product.id,
            name: product.name,
            title: product.title,
            text: product.text,
          });
          this.editProduct = true;
        } else {
          this.editProduct = false;
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.formSubscription.unsubscribe();
  }

  createForm() {
    this.productForm = this.fb.group({
      id: [''],
      name: ['', Validators.required],
      title: ['', Validators.required],
      text: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.editProduct) {
      this.formSubscription.add(
        this.store
          .dispatch(
            new UpdateProduct(this.productForm.value, this.productForm.value.id)
          )
          .subscribe(() => {
            this.clearForm();
          })
      );
    } else {
      this.formSubscription.add(
        (this.formSubscription = this.store
          .dispatch(new AddProduct(this.productForm.value))
          .subscribe(() => {
            this.clearForm();
          }))
      );
    }
  }

  clearForm() {
    this.productForm.reset();
    this.store.dispatch(new SetSelectedProduct(null!));
  }
}
