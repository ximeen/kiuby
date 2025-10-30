import { FastifyReply, FastifyRequest } from "fastify";
import { number, object, string, uuid } from "zod";


const createProductSchema = object({
    name: string().min(3),
    description: string().optional(),
    sku: string().min(3),
    price: number().positive(),
    costPrice: number().positive().optional(),
    categoryId: uuid().optional(),
    minStockLevel: number().min(0),
    maxStockLevel: number().min(0).optional(),
    unit: string().default("UN")
})

const updateProductSchema = object({
    name: string().min(3).optional(),
    description: string().optional(),
    price: number().positive().optional(),
    costPrice: number().positive().optional(),
    minStockLevel: number().min(0).optional(),
    maxStockLevel: number().min(0).optional()
})

export class ProductController {
    async create(request: FastifyRequest, reply: FastifyReply){
        const data = createProductSchema.parse(request.body);
        
    }
}