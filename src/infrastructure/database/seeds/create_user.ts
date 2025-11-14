import { Email } from "@domain/entities/customers/value_objects/email";
import { User, UserRole } from "@domain/entities/user/user_entity";
import { Password } from "@domain/entities/user/value_objects/password";
import { Username } from "@domain/entities/user/value_objects/username";
import { db } from "../drizzle/client";
import { users } from "../drizzle/schema";

const userToCreate = {
  name: "Administrator",
  username: "admin",
  email: "admin@admin.com",
  password: "123456",
  role: UserRole.ADMIN,
};

async function createUser() {
  try {
    const user = User.create({
      name: userToCreate.name,
      username: Username.create(userToCreate.username),
      email: Email.create(userToCreate.email),
      password: await Password.create(userToCreate.password),
      role: userToCreate.role,
    });

    await db.insert(users).values({
      id: user.id,
      name: user.name,
      username: user.username.value,
      email: user.email.value,
      password: user.password.hash,
      role: user.role,
      status: user.status,
    });
    console.log("✅ Usuário criado com sucesso!");
    console.log(`   Username: ${userToCreate.username}`);
    console.log(`   Password: ${userToCreate.password}`);
    console.log(`   Role: ${userToCreate.role}`);
  } catch (error) {
    console.error("❌ Erro ao criar usuário:", error);
  } finally {
    process.exit();
  }
}

createUser();
