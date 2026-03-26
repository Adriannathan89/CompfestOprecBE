import { IsString, IsBoolean, IsNumber } from "class-validator";

export class AddClassDto {
    @IsString()
    name: string;

    @IsString()
    subjectId: string;
    
    @IsBoolean()
    isHiddenLecturer: boolean;

    @IsNumber()
    classCapacity: number;
}