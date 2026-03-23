import { Module } from "@nestjs/common";
import { DrizzleModule } from "src/db/db.module";
import { ClassController } from "./class.controller";
import { ClassService } from "./class.service";

@Module({
    imports: [DrizzleModule],
    controllers: [ClassController],
    providers: [ClassService],
    exports: [ClassService]
}) export class ClassModule {}