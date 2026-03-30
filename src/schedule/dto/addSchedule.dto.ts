import { IsInt, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class AddScheduleDto {
    @ApiProperty({ description: "Class id", example: "f633be45-67b4-4f89-a2f6-a0ce09710217" })
    @IsString()
    classId: string;

    @ApiProperty({ description: "Classroom code", example: "GK-201" })
    @IsString()
    classroom: string;
    
    @ApiProperty({ description: "Day of week (1-7)", example: 1 })
    @IsInt()
    dayOfWeek: number;

    @ApiProperty({ description: "Start time in HH:mm", example: "08:00" })
    @IsString()
    startTime: string;

    @ApiProperty({ description: "End time in HH:mm", example: "10:00" })
    @IsString()
    endTime: string;
}