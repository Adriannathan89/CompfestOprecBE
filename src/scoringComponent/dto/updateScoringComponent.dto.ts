import { PartialType } from "@nestjs/mapped-types";
import { CreateScoringComponentDto } from "./createScoringComponent.dto";

export class UpdateScoringComponentDto extends PartialType(CreateScoringComponentDto) {}