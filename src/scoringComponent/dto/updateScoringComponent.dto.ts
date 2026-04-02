import { PartialType } from "@nestjs/swagger";
import { CreateScoringComponentDto } from "./createScoringComponent.dto";

export class UpdateScoringComponentDto extends PartialType(CreateScoringComponentDto) {}