import { Module } from "@nestjs/common";
import { StudentTakingClassFormController } from "./studentTakingClassForm.controller";
import { StudentTakingClassFormService } from "./studentTakingClassForm.service";
import { DrizzleModule } from "src/db/db.module";

@Module({
    imports: [DrizzleModule],
    controllers: [StudentTakingClassFormController],
    providers: [StudentTakingClassFormService],
    exports: [StudentTakingClassFormService]
}) 
export class StudentTakingClassFormModule {}