import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Product } from '../../product/entity/product.entity';
import { CreateOrderInput } from '../dtos/create-order.input';
import { UpdateOrderInput } from '../dtos/update-order.input';
import { OrderItem } from '../entity/order-item.entity';
import { Order } from '../entity/order.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(data: CreateOrderInput): Promise<Order> {
    const order = this.orderRepository.create({ tableId: data.tableId });
    const savedOrder = await this.orderRepository.save(order);

    const items: OrderItem[] = [];

    for (const item of data.items) {
      const product = await this.productRepository.findOne({
        where: { id: item.productId },
      });

      if (!product) {
        throw new NotFoundException(
          `Produto ${item.productId} nao encontrado`,
        );
      }

      const orderItem = this.orderItemRepository.create({
        orderId: savedOrder.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: product.price,
      });

      items.push(await this.orderItemRepository.save(orderItem));
    }

    return this.findById(savedOrder.id) as Promise<Order>;
  }

  findAll(): Promise<Order[]> {
    return this.orderRepository.find({
      relations: { table: true, items: { product: true } },
    });
  }

  findById(id: string): Promise<Order | null> {
    return this.orderRepository.findOne({
      where: { id },
      relations: { table: true, items: { product: true } },
    });
  }

  async update(id: string, data: UpdateOrderInput): Promise<Order> {
    const order = await this.findById(id);

    if (!order) {
      throw new NotFoundException('Pedido nao encontrado');
    }

    if (data.tableId) {
      order.tableId = data.tableId;
    }

    if (data.items) {
      await this.orderItemRepository.delete({ orderId: id });

      const items: OrderItem[] = [];

      for (const item of data.items) {
        const product = await this.productRepository.findOne({
          where: { id: item.productId },
        });

        if (!product) {
          throw new NotFoundException(
            `Produto ${item.productId} nao encontrado`,
          );
        }

        const orderItem = this.orderItemRepository.create({
          orderId: id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: product.price,
        });

        items.push(await this.orderItemRepository.save(orderItem));
      }

      order.items = items;
    }

    await this.orderRepository.save(order);

    return this.findById(id) as Promise<Order>;
  }

  async delete(id: string): Promise<Order> {
    const order = await this.findById(id);

    if (!order) {
      throw new NotFoundException('Pedido nao encontrado');
    }

    await this.orderItemRepository.delete({ orderId: id });
    await this.orderRepository.remove(order);

    return order;
  }
}
