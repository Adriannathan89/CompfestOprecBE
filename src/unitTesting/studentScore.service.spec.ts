import { StudentScoreService } from "src/studentScore/studentScore.service";
import { StudentScore } from "src/db/schema/studentScore.schema";
import { FailDatabaseResponse } from "src/db/response/systemResponse/fail-db.response";

describe("StudentScoreService", () => {
    function createDbMock() {
        const insertValuesMock = jest.fn();
        const insertReturningMock = jest.fn();
        const updateSetMock = jest.fn();
        const updateWhereMock = jest.fn();
        const updateReturningMock = jest.fn();
        const deleteWhereMock = jest.fn();
        const scoreFindManyMock = jest.fn();

        insertValuesMock.mockReturnValue({ returning: insertReturningMock });
        updateWhereMock.mockReturnValue({ returning: updateReturningMock });
        updateSetMock.mockReturnValue({ where: updateWhereMock });
        deleteWhereMock.mockResolvedValue(undefined);

        const dbMock: any = {
            query: {
                StudentScore: {
                    findMany: scoreFindManyMock,
                },
            },
            insert: jest.fn((table: unknown) => {
                if (table !== StudentScore) {
                    throw new Error("Unexpected table for insert");
                }

                return {
                    values: insertValuesMock,
                };
            }),
            update: jest.fn((table: unknown) => {
                if (table !== StudentScore) {
                    throw new Error("Unexpected table for update");
                }

                return {
                    set: updateSetMock,
                };
            }),
            delete: jest.fn((table: unknown) => {
                if (table !== StudentScore) {
                    throw new Error("Unexpected table for delete");
                }

                return {
                    where: deleteWhereMock,
                };
            }),
        };

        return {
            dbMock,
            mocks: {
                insertValuesMock,
                insertReturningMock,
                updateSetMock,
                updateWhereMock,
                updateReturningMock,
                deleteWhereMock,
                scoreFindManyMock,
            },
        };
    }

    it("should input student score", async () => {
        const { dbMock, mocks } = createDbMock();
        mocks.insertReturningMock.mockResolvedValueOnce([
            {
                id: "score-1",
                studentTakingClassFormId: "form-1",
                scoringComponentId: "component-1",
                percentage: "80",
                isPublished: true,
            },
        ]);

        const service = new StudentScoreService(dbMock);

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
        expect(result.success).toBe(true);
        expect(result.statusCode).toBe(201);
        expect(result.message).toBe("Student score input successfully");
    });

    it("should update student score", async () => {
        const { dbMock, mocks } = createDbMock();
        mocks.updateReturningMock.mockResolvedValueOnce([
            {
                id: "score-1",
                percentage: "88",
                isPublished: true,
            },
        ]);

        const service = new StudentScoreService(dbMock);

        const result = await service.updateStudentScore("score-1", {
            percentage: "88",
            isPublished: true,
        });

        expect(mocks.updateSetMock).toHaveBeenCalledWith({ percentage: "88", isPublished: true });
        expect(result.success).toBe(true);
        expect(result.statusCode).toBe(200);
        expect(result.data).toMatchObject({ id: "score-1", percentage: "88" });
    });

    it("should delete student score", async () => {
        const { dbMock, mocks } = createDbMock();

        const service = new StudentScoreService(dbMock);

        const result = await service.deleteStudentScore("score-1");

        expect(mocks.deleteWhereMock).toHaveBeenCalledTimes(1);
        expect(result.success).toBe(true);
        expect(result.statusCode).toBe(200);
        expect(result.data).toBeNull();
    });

    it("should calculate final score as final when all components are published", async () => {
        const { dbMock, mocks } = createDbMock();
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

        const service = new StudentScoreService(dbMock);

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
        const { dbMock, mocks } = createDbMock();
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

        const service = new StudentScoreService(dbMock);

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
        const { dbMock, mocks } = createDbMock();
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

        const service = new StudentScoreService(dbMock);

        const result: any = await service.calculateFinalScore("form-1");

        expect(result.data.FinalGradePercentage).toBe(80);
        expect(result.data.FinalGrade).toBe("A-");
        expect(result.data.message).toBe("Final Score");
    });

    it("should throw fail response when calculate final score query fails", async () => {
        const { dbMock, mocks } = createDbMock();
        mocks.scoreFindManyMock.mockRejectedValueOnce(new Error("db error"));

        const service = new StudentScoreService(dbMock);

        await expect(service.calculateFinalScore("form-1")).rejects.toBeInstanceOf(FailDatabaseResponse);
    });

    it("should throw fail response when input student score insert fails", async () => {
        const { dbMock, mocks } = createDbMock();
        mocks.insertReturningMock.mockRejectedValueOnce(new Error("insert failed"));

        const service = new StudentScoreService(dbMock);

        await expect(service.inputStudentScore({
            studentTakingClassFormId: "form-1",
            scoringComponentId: "component-1",
            percentage: "80",
            isPublished: true,
        })).rejects.toBeInstanceOf(FailDatabaseResponse);
    });

    it("should throw fail response when update student score update fails", async () => {
        const { dbMock, mocks } = createDbMock();
        mocks.updateReturningMock.mockRejectedValueOnce(new Error("update failed"));

        const service = new StudentScoreService(dbMock);

        await expect(service.updateStudentScore("score-1", {
            percentage: "88",
            isPublished: true,
        })).rejects.toBeInstanceOf(FailDatabaseResponse);
    });

    it("should throw fail response when delete student score delete fails", async () => {
        const { dbMock, mocks } = createDbMock();
        mocks.deleteWhereMock.mockRejectedValueOnce(new Error("delete failed"));

        const service = new StudentScoreService(dbMock);

        await expect(service.deleteStudentScore("score-1")).rejects.toBeInstanceOf(FailDatabaseResponse);
    });

    it("should return E with zero score when no components are found", async () => {
        const { dbMock, mocks } = createDbMock();
        mocks.scoreFindManyMock.mockResolvedValueOnce([]);

        const service = new StudentScoreService(dbMock);

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
        const { dbMock, mocks } = createDbMock();
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

        const service = new StudentScoreService(dbMock);

        const result: any = await service.calculateFinalScore("form-1");

        expect(result.data.FinalGrade).toBe(expectedGrade);
    });
});
