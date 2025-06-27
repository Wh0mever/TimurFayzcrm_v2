export type user = {
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

