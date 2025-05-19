import { EntityManager } from 'typeorm';

interface UpdateGenericRecord<UpdateRecordPayload, IdentifierOptions> {
  updatePayload: UpdateRecordPayload;
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

export default UpdateGenericRecord;
