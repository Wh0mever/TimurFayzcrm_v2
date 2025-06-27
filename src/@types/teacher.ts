import { user } from "./user"

export type teacher = {
    id: number,
    user: user
    salary: string,
    department: "SCHOOL" | "CAMP" | "KINDERGARTEN"
}