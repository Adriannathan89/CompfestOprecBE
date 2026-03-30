import { IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {
    @ApiProperty({
        description: "Username used during login",
        example: "john_doe",
    })
    @IsString()
    username: string;

    @ApiProperty({
        description: "Password used during login",
        example: "StrongPassword123",
    })
    @IsString()
    password: string
}