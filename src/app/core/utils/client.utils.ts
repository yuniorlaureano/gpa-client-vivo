import { ClientModel } from '../../invoice/model/client.model';
import { ClientCreditModel } from '../../invoice/model/client-credit.model';
import { ClientDebitModel } from '../../invoice/model/client-debit.model';

export const getTotalClientFees = (client: ClientModel | null) => {
  let credit = getCredit(client?.credits);
  let debit = getDebit(client?.debits);
  return {
    credit: credit - debit <= 0 ? 0 : credit,
    debit: debit,
  };
};

function getCredit(credits?: ClientCreditModel[]) {
  let totalClientCredit = 0;
  if (!credits) {
    return 0;
  }
  credits.forEach((item) => {
    totalClientCredit += item.credit;
  });
  return totalClientCredit;
}

function getDebit(debits?: ClientDebitModel[]) {
  if (!debits) {
    return 0;
  }
  let totalClientDebit = 0;
  debits.forEach((item) => {
    totalClientDebit += item.pendingPayment;
  });
  return totalClientDebit;
}
