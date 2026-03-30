import { Inject, Injectable } from "@nestjs/common";
import { DRIZZLE, type DrizzleDB } from "src/db/drizzle.provider";
import { InputStudentScoreDto } from "./dto/inputStudentScore.dto";
import { DatabaseResponse } from "src/db/response/systemResponse/db.response";
import { StudentScore } from "src/db/schema/studentScore.schema";
import { UpdateStudentScoreDto } from "./dto/updateStudentScote.dto";
import { eq } from "drizzle-orm";
import { FailDatabaseResponse } from "src/db/response/systemResponse/fail-db.response";
import { StudentScoringCalculationResponse } from "src/db/response/customSchemaResponse/studentScroingCalculation.response";

@Injectable()
export class StudentScoreService {
    constructor (
        @Inject(DRIZZLE) private readonly db: DrizzleDB
    ) {}

    private mapScoreToGrade(percentage: number): string {
        if(percentage >= 85) {
            return "A";
        } else if (percentage >= 80) {
            return "A-";
        } else if (percentage >= 75) {
            return "B+";
        } else if (percentage >= 70) {
            return "B";
        } else if (percentage >= 65) {
            return "B-";
        } else if (percentage >= 60) {
            return "C+";
        } else if (percentage >= 55) {
            return "C";
        } else if (percentage >= 50) {
            return "D";
        } else {
            return "E";
        }
    }
    
    async inputStudentScore(req: InputStudentScoreDto) {
        try {
            const newScore = await this.db.insert(StudentScore)
                .values({
                    studentTakingClassFormId: req.studentTakingClassFormId,
                    scoringComponentId: req.scoringComponentId,
                    percentage: req.percentage,
                    isPublished: req.isPublished,
                })
                .returning();
            const databaseResponse = new DatabaseResponse(true, 201, newScore[0], "Student score input successfully");
            return databaseResponse;
        } catch (error) {
            throw new FailDatabaseResponse("Failed to input student score");

        }
    }

    async updateStudentScore(id: string, req: UpdateStudentScoreDto) {
        try {
            const updatedScore = await this.db.update(StudentScore)
                .set(req)
                .where(eq(StudentScore.id, id))
                .returning();
            const databaseResponse = new DatabaseResponse(true, 200, updatedScore[0], "Student score updated successfully");
            return databaseResponse;
        } catch (error) {
            throw new FailDatabaseResponse("Failed to update student score");
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

    async calculateFinalScore(studentTakingClassFormId: string) {
        try {
            const scores = await this.db.query.StudentScore.findMany({
                where: eq(StudentScore.studentTakingClassFormId, studentTakingClassFormId),
                with: {
                    scoringComponent: true,
                },
            });
            let isPublishedAll = true;

            const scoringDetails = new StudentScoringCalculationResponse();
            scoringDetails.scoringDetails = [];

            const finalScore = scores.reduce((acc, score) => {
                const percentage = parseFloat(score.percentage) / 100;
                if (!score.isPublished) {
                    isPublishedAll = false;
                }

                scoringDetails.scoringDetails.push({
                    scoringComponentName: score.scoringComponent.name,
                    percentage: percentage,
                });

                return acc + (score.isPublished ? percentage * score.scoringComponent.weight : 0);
            }, 0);

            scoringDetails.FinalGradePercentage = finalScore;
            const finalGrade = this.mapScoreToGrade(finalScore);
            scoringDetails.FinalGrade = finalGrade;
            scoringDetails.message = isPublishedAll ? "Final Score" : "Partial Score";

            const databaseResponse = new DatabaseResponse(true, 200, scoringDetails, "Final score calculated successfully");
            return databaseResponse;
        } catch (error) {
            throw new FailDatabaseResponse("Failed to calculate final score");
        }
    }
}