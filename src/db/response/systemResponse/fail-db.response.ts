import { InternalServerErrorException } from "@nestjs/common";

export class FailDatabaseResponse extends InternalServerErrorException {
    constructor(message: string) {
        super(message);
    }
    statuscode: number = 500;
    success: boolean = false;
}