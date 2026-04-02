import { PartialType } from "@nestjs/swagger";
import { InputStudentScoreDto } from "./inputStudentScore.dto";

export class UpdateStudentScoreDto extends PartialType(InputStudentScoreDto) {}