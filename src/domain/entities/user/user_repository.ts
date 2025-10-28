import type { User } from "./user_entity";

export interface IUserRepository {
  save(user: User): Promise<void>;
  findById(id: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(filters?: UserFilters): Promise<User[]>;
  update(user: User): Promise<void>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
}

export interface UserFilters {
  status?: string;
  role?: string;
  searchTerm?: string;
}
