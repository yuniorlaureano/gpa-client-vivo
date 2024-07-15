import { ProfileModel } from './profile.model';

export interface UserModel {
  id: string | null;
  firstName: string;
  lastName: string;
  email: string;
  userName: string;
  profiles: ProfileModel[];
}
