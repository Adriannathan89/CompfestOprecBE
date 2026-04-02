import { Module } from "@nestjs/common";
import { StudentScoreUpdaterService } from "./studentScoreUpdater.service";
import { StudentScoreController } from "./studentScore.controller";
import { DrizzleModule } from "src/db/db.module";
import { StudentScoreGetterService } from "./studentScoreGetter.service";

@Module({
    imports: [DrizzleModule],
    providers: [
        StudentScoreUpdaterService,
        StudentScoreGetterService
    ],
    controllers: [StudentScoreController],
    exports: [
        StudentScoreUpdaterService, 
        StudentScoreGetterService
    ]
})
export class StudentScoreModule {}