// ========================================
// ADVANCED UTILITY TYPES
// ========================================

/**
 * Make all properties optional except specified keys
 */
export type OptionalExcept<T, K extends keyof T> = Partial<Omit<T, K>> & Pick<T, K>;

/**
 * Make all properties required except specified keys
 */
export type RequiredExcept<T, K extends keyof T> = Required<Omit<T, K>> & Pick<T, K>;

/**
 * Make all properties readonly except specified keys
 */
export type ReadonlyExcept<T, K extends keyof T> = Readonly<Omit<T, K>> & Pick<T, K>;

/**
 * Extract only the specified keys from a type
 */
export type PickRequired<T, K extends keyof T> = Pick<T, K> & Required<Pick<T, K>>;

/**
 * Extract only the optional keys from a type
 */
export type PickOptional<T, K extends keyof T> = Pick<T, K> & Partial<Pick<T, K>>;


// ========================================
// PRACTICAL UTILITY TYPES FOR SURFE DIEM
// ========================================

/**
 * Create a type for form validation
 * A breakdown of this syntax:
 * [K in keyof T] -> gets all property names for the type, eg: Spot
 * [K in ...] creates a new property for each key
 * T[K] gets the type of each property
 * Each property of Spot for example, has these validation rules,
 */
export type FormValidation<T> = {
  [K in keyof T]: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: RegExp;
    custom?: (value: T[K]) => boolean;
  };
};

/**
 * Create a type for API error handling
 */
export type ApiError<T = string> = {
  code: T;
  message: string;
  details?: Record<string, any>;
};

/**
 * Create a type for loading states
 */
export type LoadingState<T> = {
  data: T | null;
  isLoading: boolean;
  error: string | null;
};

/**
 * Create a type for pagination
 */
export type PaginationState = {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
};

/**
 * Create a type for search/filter operations
 */
export type SearchState<T> = {
  query: string;
  filters: Partial<T>;
  results: T[];
  total: number;
};

