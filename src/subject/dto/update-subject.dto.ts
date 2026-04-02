import { PartialType } from "@nestjs/swagger";
import { AddSubjectDto } from "./add-subject.dto";

export class UpdateSubjectDto extends PartialType(AddSubjectDto) {}