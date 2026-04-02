export class StudentScoringCalculationResponse {
    FinalGrade: string;
    FinalGradePercentage: number;
    message: string;
    scoringDetails: {
        scoringComponentName: string;
        percentage: number | string;
        weight: number
    }[]
}