import {student} from "@/@types/student";
import {outlayCategories} from "@/@types/outlayCategories";
import {user} from "@/@types/user";

export type payment = {
    "payment_type": "INCOME" | "OUTCOME" ,
    "payment_method": "CASH" | "CARD" | "TRANSFER",
    "payment_model_type": "STUDENT" | "OUTLAY",
    "student": number | null,
    "amount": string,
    "id": number,
    "student_obj": student | null,
    "outlay": number | null,
    "outlay_obj": outlayCategories | null,
    "created_at": string,
    "created_user": user,
    comment?: string,
    payment_date?: string,
    department:string
}
