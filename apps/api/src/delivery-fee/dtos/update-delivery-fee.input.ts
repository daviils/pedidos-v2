import { InputType, PartialType } from '@nestjs/graphql';

import { CreateDeliveryFeeInput } from './create-delivery-fee.input';

@InputType()
export class UpdateDeliveryFeeInput extends PartialType(CreateDeliveryFeeInput) {}
