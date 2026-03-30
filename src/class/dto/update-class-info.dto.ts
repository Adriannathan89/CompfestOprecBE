import { PartialType } from "@nestjs/swagger";
import { AddClassDto } from "./add-class.dto";

export class UpdateClassInfoDto extends PartialType(AddClassDto) {}