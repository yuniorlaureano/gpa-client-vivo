export type Profile = {
  app: string;
  modules: {
    id: string;
    components: {
      id: string;
      permissions: string[];
    }[];
  }[];
};
