import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Store } from '../../store/entity/store.entity';

export enum TableStatus {
  Open = 'open',
  Close = 'close',
}

registerEnumType(TableStatus, {
  name: 'TableStatus',
});

@Entity('tables')
@ObjectType()
export class Table {
  @Field(() => String)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column()
  storeId: string;

  @Field(() => String)
  @Column()
  name: string;

  @Field(() => TableStatus)
  @Column({
    type: 'simple-enum',
    enum: TableStatus,
    default: TableStatus.Open,
  })
  status: TableStatus;

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn()
  updatedAt: Date;

  @Field(() => Date, { nullable: true })
  @DeleteDateColumn({ nullable: true })
  deletedAt: Date | null;

  @Field(() => Store)
  @ManyToOne(() => Store, (store) => store.tables)
  @JoinColumn({ name: 'storeId' })
  store: Store;
}
