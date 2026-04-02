import { FailDatabaseResponse } from "src/db/response/systemResponse/fail-db.response";
import { StudentScoreGetterService } from "src/studentScore/studentScoreGetter.service";
import { StudentScoreUpdaterService } from "src/studentScore/studentScoreUpdater.service";

describe("StudentScoreUpdaterService", () => {
    function createUpdaterDbMock() {
        const insertValuesMock = jest.fn();
        const insertOnConflictDoUpdateMock = jest.fn();
        const insertReturningMock = jest.fn();
        const deleteWhereMock = jest.fn();

        const insertChain = {
            values: (payload: unknown) => {
                insertValuesMock(payload);
                return {
                    onConflictDoUpdate: (conflictPayload: unknown) => {
                        insertOnConflictDoUpdateMock(conflictPayload);
                        return {
                            returning: insertReturningMock,
                        };
                    },
                };
            },
        };

        deleteWhereMock.mockResolvedValue(undefined);

        const dbMock: any = {
            insert: jest.fn(() => insertChain),
            delete: jest.fn(() => {
                return {
                    where: deleteWhereMock,
                };
            }),
        };

        return {
            dbMock,
            mocks: {
                insertValuesMock,
                insertOnConflictDoUpdateMock,
                insertReturningMock,
                deleteWhereMock,
            },
        };
    }

    it("should create student score", async () => {
        const { dbMock, mocks } = createUpdaterDbMock();
        mocks.insertReturningMock.mockResolvedValueOnce([
            {
                id: "score-1",
                studentTakingClassFormId: "form-1",
                scoringComponentId: "component-1",
                percentage: "80",
                isPublished: true,
            },
        ]);

        const service = new StudentScoreUpdaterService(dbMock);

        const result = await service.inputStudentScore({
            studentTakingClassFormId: "form-1",
            scoringComponentId: "component-1",
            percentage: "80",
            isPublished: true,
        });

        expect(mocks.insertValuesMock).toHaveBeenCalledWith(
            expect.objectContaining({
                studentTakingClassFormId: "form-1",
                scoringComponentId: "component-1",
                percentage: "80",
                isPublished: true,
            }),
        );
        expect(mocks.insertOnConflictDoUpdateMock).toHaveBeenCalledTimes(1);
        expect(result.success).toBe(true);
        expect(result.statusCode).toBe(200);
        expect(result.message).toBe("Student score upserted successfully");
    });

    it("should update student score when duplicate exists", async () => {
        const { dbMock, mocks } = createUpdaterDbMock();
        mocks.insertReturningMock.mockResolvedValueOnce([
            {
                id: "score-1",
                studentTakingClassFormId: "form-1",
                scoringComponentId: "component-1",
                percentage: "90",
                isPublished: true,
            },
        ]);

        const service = new StudentScoreUpdaterService(dbMock);

        const result = await service.inputStudentScore({
            studentTakingClassFormId: "form-1",
            scoringComponentId: "component-1",
            percentage: "90",
            isPublished: true,
        });

        expect(mocks.insertOnConflictDoUpdateMock).toHaveBeenCalledTimes(1);
        expect(result.success).toBe(true);
        expect(result.statusCode).toBe(200);
        expect(result.message).toBe("Student score upserted successfully");
    });

    it("should delete student score", async () => {
        const { dbMock, mocks } = createUpdaterDbMock();
        const service = new StudentScoreUpdaterService(dbMock);

        const result = await service.deleteStudentScore("score-1");

        expect(mocks.deleteWhereMock).toHaveBeenCalledTimes(1);
        expect(result.success).toBe(true);
        expect(result.statusCode).toBe(200);
        expect(result.data).toBeNull();
    });

    it("should throw fail response when input student score insert fails", async () => {
        const { dbMock, mocks } = createUpdaterDbMock();
        mocks.insertReturningMock.mockRejectedValueOnce(new Error("insert failed"));

        const service = new StudentScoreUpdaterService(dbMock);

        await expect(service.inputStudentScore({
            studentTakingClassFormId: "form-1",
            scoringComponentId: "component-1",
            percentage: "80",
            isPublished: true,
        })).rejects.toBeInstanceOf(FailDatabaseResponse);
    });

    it("should throw fail response when delete student score fails", async () => {
        const { dbMock, mocks } = createUpdaterDbMock();
        mocks.deleteWhereMock.mockRejectedValueOnce(new Error("delete failed"));

        const service = new StudentScoreUpdaterService(dbMock);

        await expect(service.deleteStudentScore("score-1")).rejects.toBeInstanceOf(FailDatabaseResponse);
    });
});

describe("StudentScoreGetterService", () => {
    function createGetterDbMock() {
        const scoreFindManyMock = jest.fn();

        const dbMock: any = {
            query: {
                StudentScore: {
                    findMany: scoreFindManyMock,
                },
            },
        };

        return {
            dbMock,
            mocks: {
                scoreFindManyMock,
            },
        };
    }

    it("should calculate final score as final when all components are published", async () => {
        const { dbMock, mocks } = createGetterDbMock();
        mocks.scoreFindManyMock.mockResolvedValueOnce([
            {
                id: "score-1",
                percentage: "80",
                isPublished: true,
                scoringComponent: {
                    name: "UTS",
                    weight: 40,
                },
            },
            {
                id: "score-2",
                percentage: "90",
                isPublished: true,
                scoringComponent: {
                    name: "UAS",
                    weight: 60,
                },
            },
        ]);

        const service = new StudentScoreGetterService(dbMock);

        const result: any = await service.calculateFinalScore("form-1");

        expect(result.success).toBe(true);
        expect(result.statusCode).toBe(200);
        expect(result.message).toBe("Final score calculated successfully");
        expect(result.data.message).toBe("Final Score");
        expect(result.data.FinalGradePercentage).toBeCloseTo(86, 8);
        expect(result.data.FinalGrade).toBe("A");
        expect(result.data.scoringDetails).toEqual([
            { scoringComponentName: "UTS", percentage: 0.8 },
            { scoringComponentName: "UAS", percentage: 0.9 },
        ]);
    });

    it("should calculate partial score and exclude unpublished component from weighted score", async () => {
        const { dbMock, mocks } = createGetterDbMock();
        mocks.scoreFindManyMock.mockResolvedValueOnce([
            {
                id: "score-1",
                percentage: "80",
                isPublished: true,
                scoringComponent: {
                    name: "UTS",
                    weight: 50,
                },
            },
            {
                id: "score-2",
                percentage: "100",
                isPublished: false,
                scoringComponent: {
                    name: "UAS",
                    weight: 50,
                },
            },
        ]);

        const service = new StudentScoreGetterService(dbMock);

        const result: any = await service.calculateFinalScore("form-1");

        expect(result.success).toBe(true);
        expect(result.statusCode).toBe(200);
        expect(result.data.message).toBe("Partial Score");
        expect(result.data.FinalGradePercentage).toBeCloseTo(40, 8);
        expect(result.data.FinalGrade).toBe("E");
        expect(result.data.scoringDetails).toEqual([
            { scoringComponentName: "UTS", percentage: 0.8 },
            { scoringComponentName: "UAS", percentage: 1 },
        ]);
    });

    it("should map exact boundary score 80 to grade A-", async () => {
        const { dbMock, mocks } = createGetterDbMock();
        mocks.scoreFindManyMock.mockResolvedValueOnce([
            {
                id: "score-1",
                percentage: "80",
                isPublished: true,
                scoringComponent: {
                    name: "Final",
                    weight: 100,
                },
            },
        ]);

        const service = new StudentScoreGetterService(dbMock);

        const result: any = await service.calculateFinalScore("form-1");

        expect(result.data.FinalGradePercentage).toBe(80);
        expect(result.data.FinalGrade).toBe("A-");
        expect(result.data.message).toBe("Final Score");
    });

    it("should throw fail response when calculate final score query fails", async () => {
        const { dbMock, mocks } = createGetterDbMock();
        mocks.scoreFindManyMock.mockRejectedValueOnce(new Error("db error"));

        const service = new StudentScoreGetterService(dbMock);

        await expect(service.calculateFinalScore("form-1")).rejects.toBeInstanceOf(FailDatabaseResponse);
    });

    it("should return E with zero score when no components are found", async () => {
        const { dbMock, mocks } = createGetterDbMock();
        mocks.scoreFindManyMock.mockResolvedValueOnce([]);

        const service = new StudentScoreGetterService(dbMock);

        const result: any = await service.calculateFinalScore("form-1");

        expect(result.success).toBe(true);
        expect(result.data.FinalGradePercentage).toBe(0);
        expect(result.data.FinalGrade).toBe("E");
        expect(result.data.message).toBe("Final Score");
        expect(result.data.scoringDetails).toEqual([]);
    });

    it.each([
        { score: "75", expectedGrade: "B+" },
        { score: "70", expectedGrade: "B" },
        { score: "65", expectedGrade: "B-" },
        { score: "60", expectedGrade: "C+" },
        { score: "55", expectedGrade: "C" },
        { score: "50", expectedGrade: "D" },
        { score: "49.99", expectedGrade: "E" },
    ])("should map score $score to $expectedGrade", async ({ score, expectedGrade }) => {
        const { dbMock, mocks } = createGetterDbMock();
        mocks.scoreFindManyMock.mockResolvedValueOnce([
            {
                id: "score-1",
                percentage: score,
                isPublished: true,
                scoringComponent: {
                    name: "Final",
                    weight: 100,
                },
            },
        ]);

        const service = new StudentScoreGetterService(dbMock);

        const result: any = await service.calculateFinalScore("form-1");

        expect(result.data.FinalGrade).toBe(expectedGrade);
    });

    it("should get student scores by student taking class form id", async () => {
        const { dbMock, mocks } = createGetterDbMock();
        mocks.scoreFindManyMock.mockResolvedValueOnce([
            {
                id: "score-1",
                percentage: "90",
                isPublished: true,
                scoringComponent: {
                    name: "Quiz",
                    weight: 20,
                },
            },
        ]);

        const service = new StudentScoreGetterService(dbMock);

        const result: any = await service.getStudentScoreByStudentTakingClassFormId("form-1");

        expect(result.success).toBe(true);
        expect(result.statusCode).toBe(200);
        expect(result.message).toBe("Student scores retrieved successfully");
        expect(result.data).toHaveLength(1);
    });

    it("should throw fail response when get student scores query fails", async () => {
        const { dbMock, mocks } = createGetterDbMock();
        mocks.scoreFindManyMock.mockRejectedValueOnce(new Error("db error"));

        const service = new StudentScoreGetterService(dbMock);

        await expect(service.getStudentScoreByStudentTakingClassFormId("form-1")).rejects.toBeInstanceOf(FailDatabaseResponse);
    });
});
