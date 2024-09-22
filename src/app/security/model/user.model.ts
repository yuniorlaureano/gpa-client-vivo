import { ProfileModel } from './profile.model';

export interface UserModel {
  id: string | null;
  firstName: string;
  lastName: string;
  email: string;
  photo: string | null;
  userName: string;
  profiles: ProfileModel[];
  deleted: boolean;
  invited: boolean;
  emailConfirmed: boolean;
  currentUser: boolean;
}
