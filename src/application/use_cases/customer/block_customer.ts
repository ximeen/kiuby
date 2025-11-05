import { ICustomerRepository } from "@domain/entities/customers/customer_repository";
import { NotFoundError } from "@shared/errors/domain_error";


export class BlockCustomerUseCase {
    constructor(private customerRepo: ICustomerRepository){}

    async execute(id: string):Promise<void>{
        const customer = await this.customerRepo.findById(id);

        if(!customer) {
            throw new NotFoundError("Customer", id)
        }

        customer.block();
        await this.customerRepo.update(customer)
    }
}