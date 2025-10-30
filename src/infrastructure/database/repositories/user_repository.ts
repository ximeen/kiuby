import { User, UserRole, UserStatus } from "@domain/entities/user/user_entity";
import { IUserRepository, UserFilters } from "@domain/entities/user/user_repository";
import { db } from "../drizzle/client";
import { users } from "../drizzle/schema";
import { and, eq, ilike, or } from "drizzle-orm";
import { Username } from "@domain/entities/user/value_objects/username";
import { Email } from "@domain/entities/customers/value_objects/email";
import { Password } from "@domain/entities/user/value_objects/password";



export class DrizzleUserRepository implements IUserRepository {
    async save(user: User): Promise<void> {
        await db.insert(users).values({
            id: user.id,
            name: user.name,
            username: user.username.value,
            email: user.email.value,
            password: user.password.hash,
            role: user.role,
            status: user.status,
            phone: user.phone,
            lastLoginAt: user.lastLoginAt,
        })
    }

    async findById(id: string): Promise<User | null> {
        const result = await db
            .select()
            .from(users)
            .where(eq(users.id, id))
            .limit(1);
        if(result.length === 0) return null;

        return this.toDomain(result[0])
    }

    async findByUsername(username: string): Promise<User | null> {
        const result = await db
            .select()
            .from(users)
            .where(eq(users.username, username.toLowerCase()))
            .limit(1);
        
            if(result.length === 0) return null;

            return this.toDomain(result[0]);
    }

    async findByEmail(email: string): Promise<User | null> {
        const result = await db
            .select()
            .from(users)
            .where(eq(users.email, email.toLowerCase()))
            .limit(1);

        if(result.length === 0) return null;

        return this.toDomain(result[0])
    }

    async findAll(filters?: UserFilters): Promise<User[]> {
        let query = db.select().from(users);

        const conditions = [];
        if(filters?.status){
            conditions.push(eq(users.status, filters.status as any))
        }

        if(filters?.role){
            conditions.push(eq(users.role, filters.role as any))
        }
        
        if(filters?.searchTerm){
            conditions.push(
                or(
                    ilike(users.name, `%${filters.searchTerm}%`),
                    ilike(users.username, `%${filters.searchTerm}%`),
                    ilike(users.email, `%${filters.searchTerm}%`)
                )
            )
        }

        if(conditions.length > 0){
            query = query.where(and(...conditions)) as any
        }

        const result = await query;
        return result.map(r => this.toDomain(r))
    }

    async update(user: User): Promise<void> {
        await db
            .update(users)
            .set({
                name: user.name,
                email: user.email.value,
                password: user.password.hash,
                role: user.role,
                status: user.status,
                phone: user.phone,
                lastLoginAt: user.lastLoginAt,
                updatedAt: new Date(),
            })
            .where(eq(users.id, user.id))
    }

    async delete(id: string): Promise<void> {
        await db.delete(users).where(eq(users.id, id))
    }

    async exists(id: string): Promise<boolean> {
        const result = await db
            .select({id: users.id})
            .from(users)
            .where(eq(users.id, id))
            .limit(1);
        return result.length > 0;
    }

    private toDomain(row: any): User {
    return User.create(
      {
        name: row.name,
        username: Username.create(row.username),
        email: Email.create(row.email),
        password: Password.fromHash(row.password),
        role: row.role as UserRole,
        status: row.status as UserStatus,
        phone: row.phone,
        lastLoginAt: row.lastLoginAt,
      },
      row.id
    );
  }
}