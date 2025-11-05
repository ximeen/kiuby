import { ICustomerRepository } from "@domain/entities/customers/customer_repository";
import { NotFoundError } from "@shared/errors/domain_error";


interface GetCustomerByDocumentOutput {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    document: string;
    type: string;
    status: string;
    currentDebt: number;
    availableCredit: number
}

export class GetCustomerByDocumentUseCase {
    constructor(private customerRepo: ICustomerRepository){}

    async execute(document: string):Promise<GetCustomerByDocumentOutput>{
        const customer = await this.customerRepo.findByDocument(document);

        if(!customer){
            throw new NotFoundError("Customer", document)
        }

        return {
            id: customer.id,
            name: customer.name,
            email: customer.email?.value,
            phone: customer.phone?.value,
            type: customer.type,
            status: customer.status,
            document: customer.document!.value,
            currentDebt: customer.currentDebt,
            availableCredit: customer.getAvailableCredit()
        }
    }
}