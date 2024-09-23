import { IdentificationTypeEnum } from '../../core/models/identification-type.enum';
import { ClientCreditModel } from './client-credit.model';
import { ClientDebitModel } from './client-debit.model';

export interface ClientModel {
  id: string;
  name: string;
  lastName: string | null;
  email: string;
  identification: string;
  phone: string;
  identificationType: IdentificationTypeEnum;
  latitude: number | null;
  longitude: number | null;

  street: string;
  buildingNumber: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;

  formattedAddress: string | null;

  credits: ClientCreditModel[];
  debits: ClientDebitModel[];
}
