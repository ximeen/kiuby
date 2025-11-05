import { ICustomerRepository } from "@domain/entities/customers/customer_repository";
import { NotFoundError } from "@shared/errors/domain_error";


interface SetCreditLimitInput {
    customerId: string;
    creditLimit: number
}

export class SetCustomerCreditLimitUseCase {
    constructor(private customerRepo: ICustomerRepository){}

    async execute(input: SetCreditLimitInput):Promise<void>{
        const customer = await this.customerRepo.findById(input.customerId);

        if(!customer){
            throw new NotFoundError("Customer", input.customerId)
        }

        customer.setCreditLimit(input.creditLimit);
        await this.customerRepo.update(customer)
    }
}