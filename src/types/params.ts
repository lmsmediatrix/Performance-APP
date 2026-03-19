export interface ApiParams {
  skip?: number;
  limit?: number;
  sort?: string;
  filter?: {
    key?: string;
    value?: string;
  };
  searchTerm?: string;
  archiveStatus?: "none" | "only" | "include";
}
