export interface MasterProfileModel {
  app: string;
  modules: {
    id: string;
    components: {
      id: string;
      permissions: string[];
    }[];
  }[];
}
