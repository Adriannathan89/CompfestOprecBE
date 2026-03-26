import { Inject, Injectable } from "@nestjs/common";
import { type DrizzleDB } from "src/db/drizzle.provider";
import { DRIZZLE } from "src/db/drizzle.provider";
import { Users } from "src/db/schema/user.schema";
import { eq } from "drizzle-orm";
import { RoleName } from "src/db/schema";

@Injectable()
export class AuthValidationService {
    constructor(
        @Inject(DRIZZLE) private readonly db: DrizzleDB,
    ) {}
    async validateRole(userId: string) {
        const user = await this.db.query.Users.findFirst({
            where: eq(Users.id, userId),
            with: {
                userRoles: {
                    with: {
                        role: true,
                    },
                },
            },
        });

        if (!user) {
            return null;
        }
        for (const userRole of user.userRoles) {
            if (userRole.role.name === RoleName.ADMIN || userRole.role.name === RoleName.LECTURE) {
                return { validationLevel: "Tier-1" };
            }
        }
        return { validationLevel: "Tier-2" };
    }
}