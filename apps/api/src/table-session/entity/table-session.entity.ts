import { Field, Float, ObjectType, registerEnumType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Table } from '../../table/entity/table.entity';

export enum TableSessionStatus {
  Open = 'open',
  Closed = 'closed',
}

registerEnumType(TableSessionStatus, {
  name: 'TableSessionStatus',
});

@Entity('table_sessions')
@ObjectType()
export class TableSession {
  @Field(() => String)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column()
  tableId: string;

  @Field(() => Table)
  @ManyToOne(() => Table)
  @JoinColumn({ name: 'tableId' })
  table: Table;

  @Field(() => Date)
  @CreateDateColumn({ type: 'datetime2' })
  openingDate: Date;

  @Field(() => Date, { nullable: true })
  @Column({ type: 'datetime2', nullable: true })
  closingDate: Date | null;

  @Field(() => TableSessionStatus)
  @Column({
    type: 'simple-enum',
    enum: TableSessionStatus,
    default: TableSessionStatus.Open,
  })
  status: TableSessionStatus;

  @Field(() => Float, { nullable: true })
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  totalValue: number | null;
}
