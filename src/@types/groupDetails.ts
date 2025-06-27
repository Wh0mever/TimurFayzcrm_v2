import {student} from "@/@types/student";

export type groupDetails = {
    "id": number,
    "name": string,
    "start_date": string,
    "end_date": string,
    "price": string,
    "students": student[]
}