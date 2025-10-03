import { SetMetadata } from '@nestjs/common';

export const IS_MUTATION_KEY = 'isMutation';
export const Mutation = () => SetMetadata(IS_MUTATION_KEY, true);
