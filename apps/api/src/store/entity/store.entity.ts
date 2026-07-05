import { Field, ObjectType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Category } from '../../category/entity/category.entity';
import { Product } from '../../product/entity/product.entity';
import { Table } from '../../table/entity/table.entity';
import { UserAdmin } from '../../user-admin/entity/user-admin.entity';

@Entity('stores')
@ObjectType()
export class Store {
  @Field(() => String)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column()
  userAdminId: string;

  @Field(() => String)
  @Column()
  name: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  description?: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  phone?: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  address?: string;

  @Field(() => Boolean)
  @Column({ default: true })
  isActive: boolean;

  @Field(() => UserAdmin)
  @ManyToOne(() => UserAdmin, (userAdmin) => userAdmin.stores)
  @JoinColumn({ name: 'userAdminId' })
  userAdmin: UserAdmin;

  @Field(() => [Category])
  @OneToMany(() => Category, (category) => category.store)
  categories: Category[];

  @Field(() => [Product])
  @OneToMany(() => Product, (product) => product.store)
  products: Product[];

  @Field(() => [Table])
  @OneToMany(() => Table, (table) => table.store)
  tables: Table[];
}
