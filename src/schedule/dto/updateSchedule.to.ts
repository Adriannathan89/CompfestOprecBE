import { PartialType } from "@nestjs/swagger";
import { AddScheduleDto } from "./addSchedule.dto";

export class UpdateScheduleDto extends PartialType(AddScheduleDto) {}