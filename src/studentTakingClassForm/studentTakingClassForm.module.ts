import { Module } from "@nestjs/common";
import { StudentTakingClassFormController } from "./studentTakingClassForm.controller";
import { StudentTakingClassFormUpdaterService } from "./studentTakingClassFormUpdater.service";
import { StudentFinalizeClassFormService } from "./studentFinalizeClassForm.service";
import { DrizzleModule } from "src/db/db.module";
import { StudentTakingClassFormGetterService } from "./studentTakingClassFormGetter.service";

@Module({
    imports: [DrizzleModule],
    controllers: [StudentTakingClassFormController],
    providers: [
        StudentTakingClassFormUpdaterService, 
        StudentTakingClassFormGetterService, 
        StudentFinalizeClassFormService
    ],
    exports: [
        StudentTakingClassFormUpdaterService, 
        StudentTakingClassFormGetterService, 
        StudentFinalizeClassFormService
    ]
}) 
export class StudentTakingClassFormModule {}