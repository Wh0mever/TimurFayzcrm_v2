export type balanceReport = {
    "id": number,
    "date": string,
    "total": string,
    "reason": string,
    "balance_change_type": string,
    "balance_before": string,
    "balance_after": string,
    mark_for_delete: boolean,
    comment_text?:string
}