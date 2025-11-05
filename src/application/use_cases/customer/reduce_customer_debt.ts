import { ICustomerRepository } from "@domain/entities/customers/customer_repository";
import { NotFoundError } from "@shared/errors/domain_error";


interface ReduceDebtInput {
    customerId: string;
    amount: number
}

export class ReduceCustomerDebtUseCase {
    constructor(private customerRepo: ICustomerRepository){}

    async execute(input: ReduceDebtInput):Promise<void> {
        const customer = await this.customerRepo.findById(input.customerId)
        if(!customer){
            throw new NotFoundError("Customer", input.customerId)
        }

        customer.reduceDebt(input.amount);
        await this.customerRepo.update(customer);
    }
}