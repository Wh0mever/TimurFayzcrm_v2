import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { SLICE_BASE_NAME } from './constants'

export type UserState = {
    "id": number,
    "username": string,
    "first_name": string,
    "last_name": string,
    "avatar": string,
    "authority"?: string[],
    "user_type"?: string,
    "is_active": boolean,
    "is_superuser": boolean
}

const initialState: UserState = {
    "id": 0,
    "username": "",
    "first_name": "",
    "last_name": "",
    "avatar": "",
    "authority": [],
    "is_active": false,
    is_superuser: false
}

const userSlice = createSlice({
    name: `${SLICE_BASE_NAME}/user`,
    initialState,
    reducers: {
        setUser(state, action: PayloadAction<UserState>) {
            state.id = action.payload?.id
            state.avatar = action.payload?.avatar
            state.username = action.payload?.username
            state.first_name = action.payload?.first_name
            state.last_name = action.payload?.last_name
            state.is_active = action.payload?.is_active
            state.authority = action.payload?.user_type ? action.payload.is_superuser ? ["ADMIN"] : [action.payload.user_type] : undefined;
            state.is_superuser = action.payload?.is_superuser
        },
    },
})

export const { setUser } = userSlice.actions
export default userSlice.reducer
