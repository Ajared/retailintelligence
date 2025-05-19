import { EntityManager } from 'typeorm';

interface CreateGenericRecord<CreateRecordPayload> {
  createPayload: CreateRecordPayload;
  transactionOptions:
    | {
        useTransaction: false;
      }
    | {
        useTransaction: true;
        transaction: EntityManager;
      };
}

export default CreateGenericRecord;
