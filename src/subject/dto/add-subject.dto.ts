import { IsBoolean, IsNumber, IsString } from "class-validator";

export class AddSubjectDto {
    @IsString()
    name: string;

    @IsString()
    code: string;

    @IsNumber()
    sks: number;

    @IsString()
    lecturer: string;

    @IsBoolean()
    isLectureHidden: boolean;
    
    @IsNumber()
    semesterTaken: number;
}