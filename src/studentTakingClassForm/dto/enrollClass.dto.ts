import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class EnrollClassDto {
    @ApiProperty({
        description: "Class id to enroll",
        example: "f1f8fbb2-2f6f-4bcd-b7d8-c8ef69be4fe5",
    })
    @IsString()
    classId: string;
}
