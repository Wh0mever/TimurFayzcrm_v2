import { Dayjs } from "dayjs"
export type student = {
    group_ids: number[]
    id: number
    full_name?: string
    gender?: string
    phone_number?: string
    parent_phone_number?: string
    birthday_date?: string
    comment?: string
    balance?: string | undefined
    avatar?: string
    account_number?: number
    marked_for_delete?: boolean
    has_bonus?: boolean
    group_names?: string[]
    department?: string
    has_debt?: boolean | null 
}

export interface FilterParams {
    search?: string
    department?: string | null
    gender?: string | null
    marked_for_delete?: boolean | undefined
    group?: string | null
    has_bonus?: boolean | undefined | null
    bonus_start_date?: Dayjs | string | null
    bonus_end_date?: Dayjs | string | null
    has_debt?: boolean | null
}

export interface Sorting {
    full_name?: string | null
    gender?: string | null
    balance?: string | null
}
