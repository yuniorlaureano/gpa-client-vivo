export interface PrintInformationModel {
  id: string | null;
  companyLogo: string | null;
  companyName: string;
  companyDocument: string;
  companyDocumentPrefix: string;
  companyAddress: string;
  companyPhone: string;
  companyPhonePrefix: string;
  companyEmail: string;
  companyWebsite: string;
  signer: string;
  current: boolean;

  storeId: string | null;
}
