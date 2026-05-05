export interface PaginatedResult<T> {
  results: T[];
  total: number;
  page: number;
  limit: number;
}
