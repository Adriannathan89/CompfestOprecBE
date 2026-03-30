import { StudentFinalizeClassFormService } from "src/studentTakingClassForm/studentFinalizeClassForm.service";
import { ConflictRequestResponse } from "src/db/response/systemResponse/conflict-req.response";
import { FailDatabaseResponse } from "src/db/response/systemResponse/fail-db.response";

type MockSchedule = {
    id: string;
    classId: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
};

type MockClass = {
    id: string;
    schedules: MockSchedule[];
};

type MockForm = {
    id: string;
    studentId: string;
    classId: string;
    isFinalized: boolean;
    class: MockClass;
};

function makeForm(
    id: string,
    studentId: string,
    classId: string,
    schedules: Array<Omit<MockSchedule, "id" | "classId">>,
): MockForm {
    return {
        id,
        studentId,
        classId,
        isFinalized: false,
        class: {
            id: classId,
            schedules: schedules.map((schedule, idx) => ({
                id: `${classId}-s${idx + 1}`,
                classId,
                ...schedule,
            })),
        },
    };
}

describe("StudentFinalizeClassFormService", () => {
    const studentId = "student-1";

    let findManyMock: jest.Mock;
    let updateMock: jest.Mock;
    let setMock: jest.Mock;
    let whereMock: jest.Mock;
    let returningMock: jest.Mock;
    let dbMock: any;
    let service: StudentFinalizeClassFormService;

    beforeEach(() => {
        findManyMock = jest.fn();
        returningMock = jest.fn();
        whereMock = jest.fn().mockReturnValue({ returning: returningMock });
        setMock = jest.fn().mockReturnValue({ where: whereMock });
        updateMock = jest.fn().mockReturnValue({ set: setMock });

        dbMock = {
            query: {
                StudentTakingClassForm: {
                    findMany: findManyMock,
                },
            },
            update: updateMock,
        };

        service = new StudentFinalizeClassFormService(dbMock);
    });

    it("should return empty conflict response when schedules do not overlap", async () => {
        const forms: MockForm[] = [
            makeForm("f1", studentId, "class-A", [
                { dayOfWeek: 1, startTime: "08:00", endTime: "10:00" },
            ]),
            makeForm("f2", studentId, "class-B", [
                { dayOfWeek: 1, startTime: "10:00", endTime: "12:00" },
            ]),
        ];

        findManyMock.mockResolvedValueOnce(forms);

        const result: any = await service.loadAllConflictClasses(studentId);

        expect(result.success).toBe(true);
        expect(result.statusCode).toBe(200);
        expect(result.message).toBe("No schedule conflicts detected");
        expect(result.data).toEqual([]);
        expect(findManyMock).toHaveBeenCalledTimes(1);
    });

    it("should return empty conflict response for touching boundary non-conflict (10:00-10:00)", async () => {
        const forms: MockForm[] = [
            makeForm("f1", studentId, "class-A", [
                { dayOfWeek: 3, startTime: "09:00", endTime: "10:00" },
            ]),
            makeForm("f2", studentId, "class-B", [
                { dayOfWeek: 3, startTime: "10:00", endTime: "11:00" },
            ]),
        ];

        findManyMock.mockResolvedValueOnce(forms);

        const result: any = await service.loadAllConflictClasses(studentId);

        expect(result.success).toBe(true);
        expect(result.statusCode).toBe(200);
        expect(result.message).toBe("No schedule conflicts detected");
        expect(result.data).toEqual([]);
        expect(findManyMock).toHaveBeenCalledTimes(1);
    });

    it("should detect one-minute overlap as conflict", async () => {
        const forms: MockForm[] = [
            makeForm("f1", studentId, "class-A", [
                { dayOfWeek: 4, startTime: "09:00", endTime: "10:00" },
            ]),
            makeForm("f2", studentId, "class-B", [
                { dayOfWeek: 4, startTime: "09:59", endTime: "11:00" },
            ]),
        ];

        // First call is from validateScheduleConflict, second call is for class details mapping.
        findManyMock.mockResolvedValueOnce(forms).mockResolvedValueOnce(forms);

        const result: any = await service.loadAllConflictClasses(studentId);

        expect(result.success).toBe(true);
        expect(result.statusCode).toBe(200);
        expect(result.message).toBe("Conflict classes retrieved successfully");
        expect(result.data).toHaveLength(1);
        expect(result.data[0].class1?.id).toBe("class-A");
        expect(result.data[0].class2?.id).toBe("class-B");
        expect(findManyMock).toHaveBeenCalledTimes(2);
    });

    it("should return conflict class pairs when schedules overlap", async () => {
        const forms: MockForm[] = [
            makeForm("f1", studentId, "class-A", [
                { dayOfWeek: 1, startTime: "08:00", endTime: "10:00" },
            ]),
            makeForm("f2", studentId, "class-B", [
                { dayOfWeek: 1, startTime: "09:00", endTime: "11:00" },
            ]),
            makeForm("f3", studentId, "class-C", [
                { dayOfWeek: 1, startTime: "11:00", endTime: "12:00" },
            ]),
        ];

        // First call is from validateScheduleConflict, second call is for class details mapping.
        findManyMock.mockResolvedValueOnce(forms).mockResolvedValueOnce(forms);

        const result: any = await service.loadAllConflictClasses(studentId);

        expect(result.success).toBe(true);
        expect(result.statusCode).toBe(200);
        expect(result.message).toBe("Conflict classes retrieved successfully");
        expect(result.data).toHaveLength(1);
        expect(result.data[0].class1?.id).toBe("class-A");
        expect(result.data[0].class2?.id).toBe("class-B");
        expect(findManyMock).toHaveBeenCalledTimes(2);
    });

    it("should finalize forms successfully when there is no conflict", async () => {
        const forms: MockForm[] = [
            makeForm("f1", studentId, "class-A", [
                { dayOfWeek: 1, startTime: "08:00", endTime: "10:00" },
            ]),
            makeForm("f2", studentId, "class-B", [
                { dayOfWeek: 1, startTime: "10:00", endTime: "12:00" },
            ]),
        ];
        const updatedRows = [
            { id: "f1", studentId, classId: "class-A", isFinalized: true },
            { id: "f2", studentId, classId: "class-B", isFinalized: true },
        ];

        findManyMock.mockResolvedValueOnce(forms);
        returningMock.mockResolvedValueOnce(updatedRows);

        const result = await service.finalizeStudentTakingClassForm(studentId);

        expect(result.success).toBe(true);
        expect(result.statusCode).toBe(200);
        expect(result.message).toBe("Successfully finalized class form");
        expect(result.data).toEqual(null);
        expect(updateMock).toHaveBeenCalledTimes(1);
        expect(setMock).toHaveBeenCalledTimes(1);
        expect(whereMock).toHaveBeenCalledTimes(1);
        expect(returningMock).toHaveBeenCalledTimes(1);
    });

    it("should finalize successfully when there are five non-overlapping schedules", async () => {
        const forms: MockForm[] = [
            makeForm("f1", studentId, "class-A", [{ dayOfWeek: 1, startTime: "08:00", endTime: "09:00" }]),
            makeForm("f2", studentId, "class-B", [{ dayOfWeek: 1, startTime: "09:00", endTime: "10:00" }]),
            makeForm("f3", studentId, "class-C", [{ dayOfWeek: 1, startTime: "10:00", endTime: "11:00" }]),
            makeForm("f4", studentId, "class-D", [{ dayOfWeek: 1, startTime: "11:00", endTime: "12:00" }]),
            makeForm("f5", studentId, "class-E", [{ dayOfWeek: 1, startTime: "13:00", endTime: "14:00" }]),
        ];

        const updatedRows = forms.map((form) => ({
            id: form.id,
            studentId: form.studentId,
            classId: form.classId,
            isFinalized: true,
        }));

        findManyMock.mockResolvedValueOnce(forms);
        returningMock.mockResolvedValueOnce(updatedRows);

        const result = await service.finalizeStudentTakingClassForm(studentId);

        expect(result.success).toBe(true);
        expect(result.statusCode).toBe(200);
        expect(result.data).toBe(null);
        expect(updateMock).toHaveBeenCalledTimes(1);
    });

    it("should fail finalize when there are five schedules and one overlap exists", async () => {
        const forms: MockForm[] = [
            makeForm("f1", studentId, "class-A", [{ dayOfWeek: 2, startTime: "08:00", endTime: "09:00" }]),
            makeForm("f2", studentId, "class-B", [{ dayOfWeek: 2, startTime: "09:00", endTime: "10:00" }]),
            makeForm("f3", studentId, "class-C", [{ dayOfWeek: 2, startTime: "10:00", endTime: "12:00" }]),
            makeForm("f4", studentId, "class-D", [{ dayOfWeek: 2, startTime: "11:00", endTime: "13:00" }]),
            makeForm("f5", studentId, "class-E", [{ dayOfWeek: 2, startTime: "13:00", endTime: "14:00" }]),
        ];

        findManyMock.mockResolvedValueOnce(forms);

        await expect(service.finalizeStudentTakingClassForm(studentId)).rejects.toMatchObject({
            conflicts: [{ class1Id: "class-C", class2Id: "class-D" }],
        });
        expect(updateMock).not.toHaveBeenCalled();
    });

    it("should throw ConflictRequestResponse when schedule conflict is detected", async () => {
        const forms: MockForm[] = [
            makeForm("f1", studentId, "class-A", [
                { dayOfWeek: 2, startTime: "13:00", endTime: "15:00" },
            ]),
            makeForm("f2", studentId, "class-B", [
                { dayOfWeek: 2, startTime: "14:00", endTime: "16:00" },
            ]),
        ];

        findManyMock.mockResolvedValueOnce(forms);

        await expect(service.finalizeStudentTakingClassForm(studentId)).rejects.toMatchObject({
            conflicts: [{ class1Id: "class-A", class2Id: "class-B" }],
        });
        expect(updateMock).not.toHaveBeenCalled();
    });

    it("should throw FailDatabaseResponse on unexpected errors", async () => {
        findManyMock.mockRejectedValueOnce(new Error("db down"));

        await expect(service.finalizeStudentTakingClassForm(studentId)).rejects.toBeInstanceOf(FailDatabaseResponse);
    });
});