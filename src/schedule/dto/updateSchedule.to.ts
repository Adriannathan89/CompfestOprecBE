import { PartialType } from "@nestjs/mapped-types";
import { AddScheduleDto } from "./addSchedule.dto";

export class UpdateScheduleDto extends PartialType(AddScheduleDto) {}