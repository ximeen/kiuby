import { UserRole } from "@domain/entities/user/user_entity";
import { IUserRepository } from "@domain/entities/user/user_repository";
import { NotFoundError } from "@shared/errors/domain_error";

interface ChangeRoleInput {
    userId: string,
    newRole: UserRole
}

export class ChangeUserRoleUseCase {
    constructor(private userRepo: IUserRepository){}

    async execute(input: ChangeRoleInput):Promise<void>{
        const user = await this.userRepo.findById(input.userId);

        if(!user){
            throw new NotFoundError("User", input.userId)
        }
        user.changeRole(input.newRole);
        await this.userRepo.update(user);
    }
}