import { IsBoolean, IsString } from "class-validator";

export class InputStudentScoreDto {
    @IsString()
    studentTakingClassFormId: string;

    @IsString()
    scoringComponentId: string;

    @IsString()
    percentage: string;

    @IsBoolean()
    isPublished: boolean;
}