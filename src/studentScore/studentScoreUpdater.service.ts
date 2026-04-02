import { Inject, Injectable } from "@nestjs/common";
import { DRIZZLE, type DrizzleDB } from "src/db/drizzle.provider";
import { InputStudentScoreDto } from "./dto/inputStudentScore.dto";
import { DatabaseResponse } from "src/db/response/systemResponse/db.response";
import { StudentScore } from "src/db/schema/studentScore.schema";
import { eq } from "drizzle-orm";
import { FailDatabaseResponse } from "src/db/response/systemResponse/fail-db.response";


@Injectable()
export class StudentScoreUpdaterService {
    constructor (
        @Inject(DRIZZLE) private readonly db: DrizzleDB
    ) {}    
    async inputStudentScore(req: InputStudentScoreDto) {
        try {
            const upsertedScore = await this.db.insert(StudentScore)
                .values({
                    studentTakingClassFormId: req.studentTakingClassFormId,
                    scoringComponentId: req.scoringComponentId,
                    percentage: req.percentage,
                    isPublished: req.isPublished,
                })
                .onConflictDoUpdate({
                    target: [StudentScore.scoringComponentId, StudentScore.studentTakingClassFormId],
                    set: {
                        percentage: req.percentage,
                        isPublished: req.isPublished,
                    },
                })
                .returning();

            return new DatabaseResponse(true, 200, upsertedScore[0], "Student score upserted successfully");
        } catch (error) {
            throw new FailDatabaseResponse("Failed to input student score");

        }
    }

    async deleteStudentScore(id: string) {
        try {
            await this.db.delete(StudentScore)
                .where(eq(StudentScore.id, id));
            const databaseResponse = new DatabaseResponse(true, 200, null, "Student score deleted successfully");
            return databaseResponse;
        } catch (error) {
            throw new FailDatabaseResponse("Failed to delete student score");
        }
    }
}