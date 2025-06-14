import { employee } from "./employee"
import { student } from "./student"

export type groups = {
    id?: number | undefined,
    name?: string,
    start_date?: string,
    end_date?: string,
    price?: string,
    student_ids?: number[],
    marked_for_delete?: boolean,
    teacher?: number,
    teacher_obj?: employee,
    department?: "SCHOOL" | "CAMP" | "KINDERGARTEN" | string | undefined,
    students?: student[]
}

