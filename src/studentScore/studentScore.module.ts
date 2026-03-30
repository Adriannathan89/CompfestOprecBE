import { Module } from "@nestjs/common";
import { StudentScoreService } from "./studentScore.service";
import { StudentScoreController } from "./studentScore.controller";
import { DrizzleModule } from "src/db/db.module";

@Module({
    imports: [DrizzleModule],
    providers: [StudentScoreService],
    controllers: [StudentScoreController],
    exports: [StudentScoreService]
})
export class StudentScoreModule {}