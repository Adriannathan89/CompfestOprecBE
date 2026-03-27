import { StudentTakingClassFormService } from "src/studentTakingClassForm/studentTakingClassForm.service";
import { Class, StudentTakingClassForm, Users } from "src/db/schema";
import { FailDatabaseResponse } from "src/db/response/fail-db.response";

type State = {
    classRecord: {
        id: string;
        classCapacity: number;
        currentCapacity: number;
        subject: { sks: number };
    };
    userRecord: {
        id: string;
        currentSKS: number;
    };
    forms: Array<{
        id: string;
        studentId: string;
        classId: string;
        takingPosition: number;
        isFinalized: boolean;
    }>;
};

function createDbMock(initialState: State) {
    const state: State = {
        classRecord: { ...initialState.classRecord, subject: { ...initialState.classRecord.subject } },
        userRecord: { ...initialState.userRecord },
        forms: [...initialState.forms],
    };

    const updateClassReturningMock = jest.fn(async () => {
        await Promise.resolve();

        if (state.classRecord.currentCapacity <= 0) {
            return [];
        }

        state.classRecord.currentCapacity -= 1;
        return [
            {
                id: state.classRecord.id,
                classCapacity: state.classRecord.classCapacity,
                currentCapacity: state.classRecord.currentCapacity,
            },
        ];
    });

    const updateUsersWhereMock = jest.fn(async () => []);
    const insertReturningMock = jest.fn(async () => {
        const form = {
            id: `form-${state.forms.length + 1}`,
            studentId: state.userRecord.id,
            classId: state.classRecord.id,
            takingPosition: state.classRecord.classCapacity - state.classRecord.currentCapacity,
            isFinalized: false,
        };
        state.forms.push(form);
        return [form];
    });

    const dbMock: any = {
        query: {
            Class: {
                findFirst: jest.fn(async () => ({
                    id: state.classRecord.id,
                    classCapacity: state.classRecord.classCapacity,
                    currentCapacity: state.classRecord.currentCapacity,
                    subject: { sks: state.classRecord.subject.sks },
                })),
            },
            Users: {
                findFirst: jest.fn(async () => ({
                    id: state.userRecord.id,
                    currentSKS: state.userRecord.currentSKS,
                })),
            },
        },
        update: jest.fn((table: unknown) => {
            if (table === Class) {
                return {
                    set: jest.fn(() => ({
                        where: jest.fn(() => ({ returning: updateClassReturningMock })),
                    })),
                };
            }

            if (table === Users) {
                return {
                    set: jest.fn((payload: { currentSKS: number }) => {
                        state.userRecord.currentSKS = payload.currentSKS;
                        return {
                            where: updateUsersWhereMock,
                        };
                    }),
                };
            }

            throw new Error("Unexpected table for update");
        }),
        insert: jest.fn((table: unknown) => {
            if (table !== StudentTakingClassForm) {
                throw new Error("Unexpected table for insert");
            }

            return {
                values: jest.fn(() => ({
                    returning: insertReturningMock,
                })),
            };
        }),
        delete: jest.fn((table: unknown) => {
            if (table !== StudentTakingClassForm) {
                throw new Error("Unexpected table for delete");
            }

            return {
                where: jest.fn((_: unknown) => ({
                    returning: jest.fn(async () => {
                        if (state.forms.length === 0) {
                            return [];
                        }
                        const [deleted] = state.forms.splice(0, 1);
                        return [deleted];
                    }),
                })),
            };
        }),
    };

    return {
        dbMock,
        state,
        mocks: {
            updateClassReturningMock,
            updateUsersWhereMock,
            insertReturningMock,
        },
    };
}

describe("StudentTakingClassFormService", () => {
    it("should create student taking class form successfully", async () => {
        const { dbMock, state, mocks } = createDbMock({
            classRecord: {
                id: "class-1",
                classCapacity: 3,
                currentCapacity: 3,
                subject: { sks: 3 },
            },
            userRecord: {
                id: "user-1",
                currentSKS: 18,
            },
            forms: [],
        });

        const service = new StudentTakingClassFormService(dbMock);

        const result = await service.createStudentTakingClassForm("user-1", "class-1");

        expect(result.success).toBe(true);
        expect(result.statusCode).toBe(201);
        expect(result.message).toBe("Successfully enrolled in class");
        expect(state.classRecord.currentCapacity).toBe(2);
        expect(state.userRecord.currentSKS).toBe(21);
        expect(state.forms).toHaveLength(1);
        expect(mocks.updateClassReturningMock).toHaveBeenCalledTimes(1);
        expect(mocks.insertReturningMock).toHaveBeenCalledTimes(1);
        expect(mocks.updateUsersWhereMock).toHaveBeenCalledTimes(1);
    });

    it("should throw when class is full", async () => {
        const { dbMock, state } = createDbMock({
            classRecord: {
                id: "class-1",
                classCapacity: 1,
                currentCapacity: 0,
                subject: { sks: 3 },
            },
            userRecord: {
                id: "user-1",
                currentSKS: 18,
            },
            forms: [],
        });

        const service = new StudentTakingClassFormService(dbMock);

        await expect(service.createStudentTakingClassForm("user-1", "class-1")).rejects.toBeInstanceOf(FailDatabaseResponse);
        expect(state.forms).toHaveLength(0);
    });

    it("should throw when SKS limit is exceeded", async () => {
        const { dbMock, state, mocks } = createDbMock({
            classRecord: {
                id: "class-1",
                classCapacity: 3,
                currentCapacity: 3,
                subject: { sks: 4 },
            },
            userRecord: {
                id: "user-1",
                currentSKS: 22,
            },
            forms: [],
        });

        const service = new StudentTakingClassFormService(dbMock);

        await expect(service.createStudentTakingClassForm("user-1", "class-1")).rejects.toBeInstanceOf(FailDatabaseResponse);
        expect(mocks.insertReturningMock).not.toHaveBeenCalled();
        expect(state.forms).toHaveLength(0);
    });

    it("should handle race condition: only one create succeeds when one seat is left", async () => {
        const { dbMock, state, mocks } = createDbMock({
            classRecord: {
                id: "class-1",
                classCapacity: 1,
                currentCapacity: 1,
                subject: { sks: 3 },
            },
            userRecord: {
                id: "user-1",
                currentSKS: 10,
            },
            forms: [],
        });

        const service = new StudentTakingClassFormService(dbMock);

        const [first, second] = await Promise.allSettled([
            service.createStudentTakingClassForm("user-1", "class-1"),
            service.createStudentTakingClassForm("user-1", "class-1"),
        ]);

        const fulfilled = [first, second].filter((item) => item.status === "fulfilled");
        const rejected = [first, second].filter((item) => item.status === "rejected");

        expect(fulfilled).toHaveLength(1);
        expect(rejected).toHaveLength(1);
        expect(state.forms).toHaveLength(1);
        expect(state.classRecord.currentCapacity).toBe(0);
        expect(state.userRecord.currentSKS).toBe(13);
        expect(mocks.updateClassReturningMock).toHaveBeenCalledTimes(2);
        expect(mocks.insertReturningMock).toHaveBeenCalledTimes(1);
        expect(mocks.updateUsersWhereMock).toHaveBeenCalledTimes(1);
    });

    it("should delete student taking class form successfully", async () => {
        const { dbMock, state } = createDbMock({
            classRecord: {
                id: "class-1",
                classCapacity: 3,
                currentCapacity: 2,
                subject: { sks: 3 },
            },
            userRecord: {
                id: "user-1",
                currentSKS: 21,
            },
            forms: [
                {
                    id: "form-1",
                    studentId: "user-1",
                    classId: "class-1",
                    takingPosition: 1,
                    isFinalized: false,
                },
            ],
        });

        const service = new StudentTakingClassFormService(dbMock);

        const result = await service.deleteStudentTakingClassForm("form-1");

        expect(result.success).toBe(true);
        expect(result.statusCode).toBe(200);
        expect(state.forms).toHaveLength(0);
    });
});
