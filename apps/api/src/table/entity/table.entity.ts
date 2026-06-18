import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

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
  name: string;

  @Field(() => TableStatus)
  @Column({
    type: 'simple-enum',
    enum: TableStatus,
    default: TableStatus.Close,
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
}
