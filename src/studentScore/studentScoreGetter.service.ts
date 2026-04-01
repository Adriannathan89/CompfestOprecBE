import { Injectable, Inject } from "@nestjs/common";
import { DRIZZLE, type DrizzleDB } from "src/db/drizzle.provider";
import { FailDatabaseResponse } from "src/db/response/systemResponse/fail-db.response";
import { DatabaseResponse } from "src/db/response/systemResponse/db.response";
import { eq } from "drizzle-orm";
import { StudentScore } from "src/db/schema/studentScore.schema";
import { StudentScoringCalculationResponse } from "src/db/response/customSchemaResponse/studentScroingCalculation.response";

@Injectable()
export class StudentScoreGetterService {
    constructor(
        @Inject(DRIZZLE) private readonly db: DrizzleDB
    ) {}

    private mapScoreToGrade(percentage: number): string {
        if (percentage >= 85) {
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

    async getStudentScoreByStudentTakingClassFormId(studentTakingClassFormId: string) {
        try {
            const scores = await this.db.query.StudentScore.findMany({
                where: eq(StudentScore.studentTakingClassFormId, studentTakingClassFormId),
                with: {
                    scoringComponent: true,
                },
            });

            const databaseResponse = new DatabaseResponse(true, 200, scores, "Student scores retrieved successfully");
            return databaseResponse;
        } catch (error) {
            throw new FailDatabaseResponse("Failed to retrieve student scores");
        }
    }
}