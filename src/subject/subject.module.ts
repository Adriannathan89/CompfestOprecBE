import { Module } from "@nestjs/common";
import { SubjectController } from "./subject.controller";
import { SubjectService } from "./subject.service";
import { DrizzleModule } from "src/db/db.module";

@Module({
    imports: [DrizzleModule],
    controllers: [SubjectController],
    providers: [SubjectService],
    exports: [SubjectService]
}) export class SubjectModule {}