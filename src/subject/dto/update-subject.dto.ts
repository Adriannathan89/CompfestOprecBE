import { PartialType } from "@nestjs/mapped-types";
import { AddSubjectDto } from "./add-subject.dto";

export class UpdateSubjectDto extends PartialType(AddSubjectDto) {}