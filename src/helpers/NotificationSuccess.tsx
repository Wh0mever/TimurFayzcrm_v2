import { Notification, toast } from '@/components/ui'
import React from 'react'

export const NotificationSuccess = () => {
    toast.push(
        <Notification
            title={'Успешно'}
            type={"success"}
        >
            Успешно выполнено
        </Notification>,
    )
}