export interface BaseEntity {
  id: string
  createdAt: Date
  updatedAt: Date
}

export interface User extends BaseEntity {
  email: string
  name: string
  role: 'admin' | 'user'
}

export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
