import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,
    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,
    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const customer = await this.customersRepository.findById(customer_id);

    if (!customer) throw new AppError('Customer not found. Try again later.');

    const productsIds = products.map(product => {
      const id = { id: product.id };
      return id;
    });

    const productsFromDatabase = await this.productsRepository.findAllById(
      productsIds,
    );

    productsFromDatabase.forEach(productFromDB => {
      const productFromCustomer = products.find(
        productFind => productFind.id === productFromDB.id,
      );

      if (!productFromCustomer)
        throw new AppError(
          'Invalid product id. Try to create a order with a valid product.',
        );

      if (productFromCustomer?.quantity > productFromDB.quantity)
        throw new AppError(
          `Product quantity informed is higher than the avaliable. Product id: ${productFromCustomer?.id}`,
        );
    });

    const newProductsWithRenamedProperty = productsFromDatabase.map(product => {
      const renamedProperty = {
        product_id: product.id,
        ...product,
      };

      delete renamedProperty.id;
      return renamedProperty;
    });

    const order = await this.ordersRepository.create({
      customer,
      products: newProductsWithRenamedProperty,
    });

    const updateProductsQuantity = productsFromDatabase.map(productFromDB => {
      const findIndex = products.findIndex(
        findIndexProduct => findIndexProduct.id === productFromDB.id,
      );

      const productWithNewQuantity = {
        id: productFromDB.id,
        quantity: productFromDB.quantity - products[findIndex].quantity,
      };

      return productWithNewQuantity;
    });

    await this.productsRepository.updateQuantity(updateProductsQuantity);

    return order;
  }
}

export default CreateOrderService;
