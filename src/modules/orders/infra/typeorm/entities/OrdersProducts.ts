import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
} from 'typeorm';
import { Exclude } from 'class-transformer';

import Order from '@modules/orders/infra/typeorm/entities/Order';
import Product from '@modules/products/infra/typeorm/entities/Product';

@Entity('orders_products')
class OrdersProducts {
  @PrimaryGeneratedColumn('uuid')
  @Exclude()
  id: string;

  @Column()
  @Exclude()
  order_id: string;

  @ManyToOne(() => Order, order => order.orders_products)
  @JoinColumn({ name: 'order_id' })
  @Exclude()
  order: Order;

  @Column()
  product_id: string;

  @ManyToOne(() => Product, product => product.order_products, { eager: true })
  @JoinColumn({ name: 'product_id' })
  @Exclude()
  product: Product;

  @Column()
  price: number;

  @Column()
  quantity: number;

  @CreateDateColumn()
  @Exclude()
  created_at: Date;

  @UpdateDateColumn()
  @Exclude()
  updated_at: Date;
}

export default OrdersProducts;
