import { ClientCreditModel } from './client-credit.model';
import { ClientDebitModel } from './client-debit.model';

export interface ClientModel {
  id: string;
  name: string;
  lastName: string;
  identification: string;
  credits: ClientCreditModel[];
  debits: ClientDebitModel[];
}
