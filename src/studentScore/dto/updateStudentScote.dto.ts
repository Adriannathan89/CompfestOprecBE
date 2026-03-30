import { PartialType } from "@nestjs/mapped-types";
import { InputStudentScoreDto } from "./inputStudentScore.dto";

export class UpdateStudentScoreDto extends PartialType(InputStudentScoreDto) {}