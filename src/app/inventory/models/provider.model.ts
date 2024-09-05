export interface ProviderModel {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  lastName: string | null;
  identification: string;
  identificationType: number | null;

  street: string;
  buildingNumber: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;

  formattedAddress: string | null;

  latitude: number | null;
  longitude: number | null;
}
