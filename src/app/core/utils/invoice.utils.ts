import { PaymentMethodEnum } from '../models/payment-method.enum';

export function getPaymentMethodLabel(
  paymentMethod: PaymentMethodEnum
): string {
  switch (paymentMethod) {
    case PaymentMethodEnum.Cash:
      return 'Efectivo';
    case PaymentMethodEnum.BankTransfer:
      return 'Transferencia';
    case PaymentMethodEnum.CreditCard:
      return 'Tarjeta';
    case PaymentMethodEnum.Check:
      return 'Cheque';
    case PaymentMethodEnum.Other:
      return 'Otro';
    default:
      return '';
  }
}
