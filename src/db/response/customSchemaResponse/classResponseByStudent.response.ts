export type ClassResponseByStudent = {
    id: string;
    name: string;
    lecturerName: string;
    isHiddenLecturer: boolean;
    classCapacity: number;
    currentCapacity: number;
    schedules: {
        id: string;
        dayOfWeek: number;
        startTime: string;
        endTime: string;
        classroom: string;
    }[]
}