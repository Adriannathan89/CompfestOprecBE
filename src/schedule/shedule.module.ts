import { Module } from "@nestjs/common";
import { DrizzleModule } from "src/db/db.module";
import { ScheduleController } from "./schedule.controller";
import { ScheduleService } from "./schedule.service";

@Module({
    imports: [DrizzleModule],
    providers: [ScheduleService],
    controllers: [ScheduleController],
    exports: [ScheduleService]
})
export class ScheduleModule {}