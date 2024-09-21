export interface InvitationTokenModel {
  id: string;
  expiration: string;
  userId: string;
  createdByName: string;
  revoked: boolean;
  redeemed: boolean;
  createdBy: string;
  createdAt: string;
}
