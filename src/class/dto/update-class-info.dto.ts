import { PartialType } from "@nestjs/mapped-types";
import { AddClassDto } from "./add-class.dto";

export class UpdateClassInfoDto extends PartialType(AddClassDto) {}