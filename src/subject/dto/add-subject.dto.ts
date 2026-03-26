import { IsBoolean, IsNumber, IsString } from "class-validator";

export class AddSubjectDto {
    @IsString()
    name: string;

    @IsString()
    code: string;

    @IsNumber()
    sks: number;

    @IsNumber()
    semesterTaken: number;
}