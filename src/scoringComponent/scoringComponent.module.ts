import { Module } from "@nestjs/common";
import { ScoringComponentService } from "./scoringComponent.service";
import { ScoringComponentController } from "./scoringComponent.controller";
import { DrizzleModule } from "src/db/db.module";

@Module({
    imports: [DrizzleModule],
    providers: [ScoringComponentService],
    controllers: [ScoringComponentController],
    exports: [ScoringComponentService]
})
export class ScoringComponentModule {}