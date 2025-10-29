import { Product, ProductStatus } from "@domain/entities/product/product_entity";
import { IProductRepository, ProductFilters } from "@domain/entities/product/product_repository";
import { db } from "../drizzle/client";
import { products } from "../drizzle/schema";
import { and, eq, gte, ilike, lte, or, sql } from "drizzle-orm";
import { ProductName } from "@domain/entities/product/value_objects/product_name";
import { SKU } from "@domain/entities/product/value_objects/sku";
import { Money } from "@domain/entities/product/value_objects/money";


export class DrizzleProductRepository implements IProductRepository {
    async save(product: Product): Promise<void> {
        await db.insert(products).values({
            id: product.id,
            name: product.name.value,
            description: product.description,
            sku: product.sku.value,
            price: product.price.amount.toString(),
            costPrice: product.costPrice?.amount.toString(),
            status: product.status,
            categoryId: product.categoryId,
            minStockLevel: product.minStockLevel.toString(),
            maxStockLevel: product.maxStockLevel?.toString(),
            unit: product.unit,
        })
    }

    async findById(id: string): Promise<Product | null> {
        const result = await db
            .select()
            .from(products)
            .where(eq(products.id, id))
            .limit(1)

        if(result.length === 0) return null;

        return this.toDomain(result[0])
    }

    async findBySku(sku: string): Promise<Product | null> {
        const result = await db
            .select()
            .from(products)
            .where(eq(products.sku, sku))
            .limit(1);
        
        if(result.length === 0) return null;
    
        return this.toDomain(result[0])
            
    }

    async findAll(filters?: ProductFilters): Promise<Product[]> {
        let query = db.select().from(products);

        const conditions = []

        if(filters?.status){
            conditions.push(eq(products.status, filters.status as any))
        }

        if(filters?.categoryId){
            conditions.push(eq(products.categoryId, filters.categoryId))
        }

        if(filters?.searchTerm){
            conditions.push(
                or(
                    ilike(products.name, `${filters.searchTerm}`),
                    ilike(products.sku, `${filters.searchTerm}`),
                    ilike(products.description, `${filters.searchTerm}`),
                )
            )
        }

        if (filters?.minPrice !== undefined) {
            conditions.push(gte(products.price, filters.minPrice.toString()));
        }

        if (filters?.maxPrice !== undefined) {
            conditions.push(lte(products.price, filters.maxPrice.toString()));
        }

        if(conditions.length > 0){
            query = query.where(and(...conditions)) as any
        }

        const result = await query;
        return result.map((row)=> this.toDomain(row))
    }

    async update(product: Product): Promise<void> {
        await db
            .update(products)
            .set({
                name: product.name.value,
                description: product.description,
                price: product.price.amount.toString(),
                costPrice: product.costPrice?.amount.toString(),
                status: product.status,
                categoryId: product.categoryId,
                minStockLevel: product.minStockLevel.toString(),
                maxStockLevel: product.maxStockLevel?.toString(),
                unit: product.unit,
                updatedAt: new Date(),
            })
            .where(eq(products.id, product.id))
    }

    async delete(id: string): Promise<void> {
        
        await db.delete(products).where(eq(products.id, id))
    }

    async exists(id: string): Promise<boolean> {
        const result = await db
            .select({id: products.id})
            .from(products)
            .where(eq(products.id,  id))
            .limit(1);

        return result.length > 0;
    }

     private toDomain(row: any): Product {
    return Product.create(
      {
        name: ProductName.create(row.name),
        description: row.description,
        sku: SKU.create(row.sku),
        price: Money.create(parseFloat(row.price)),
        costPrice: row.costPrice ? Money.create(parseFloat(row.costPrice)) : undefined,
        status: row.status as ProductStatus,
        categoryId: row.categoryId,
        minStockLevel: parseFloat(row.minStockLevel),
        maxStockLevel: row.maxStockLevel ? parseFloat(row.maxStockLevel) : undefined,
        unit: row.unit,
      },
      row.id
    );
  }
}