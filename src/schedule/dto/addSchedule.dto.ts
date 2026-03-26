import { IsInt, IsString } from "class-validator";

export class AddScheduleDto {
    @IsString()
    classId: string;

    @IsString()
    classroom: string;
    
    @IsInt()
    dayOfWeek: number;

    @IsString()
    startTime: string;

    @IsString()
    endTime: string;
}