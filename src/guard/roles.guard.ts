import { CanActivate, ExecutionContext, Inject, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { eq } from "drizzle-orm";
import { type DrizzleDB } from "src/db/drizzle.provider";
import { DRIZZLE } from "src/db/drizzle.provider";
import { UserRole } from "src/db/schema";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        @Inject(DRIZZLE) private readonly db: DrizzleDB,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
        if (!requiredRoles) return true;

        const user = context.switchToHttp().getRequest().user;

        const data = await this.db.query.UserRole.findMany({
            with: {
                role: true,
            },
            where: eq(UserRole.userId, user.userId),
        });

        const userRoles = data.map(ur => ur.role.name);

        return requiredRoles.some(role => userRoles.includes(role));
    }
}