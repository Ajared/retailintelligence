import { EntityManager } from 'typeorm';

interface DeleteGenericRecord<IdentifierOptions> {
  identifierOptions: IdentifierOptions;
  transactionOptions:
    | {
        useTransaction: false;
      }
    | {
        useTransaction: true;
        transaction: EntityManager;
      };
}

export default DeleteGenericRecord;
