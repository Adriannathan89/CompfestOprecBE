import { IsInt, IsString } from "class-validator";

export class CreateScoringComponentDto {
    @IsString()
    classId: string;

    @IsString()
    name: string;

    @IsInt()
    weight: number;
}