import { Notification, toast } from '@/components/ui'
import React from 'react'

type errorType = {
    data: object,
    status: number,
}

export const NotificationError = (error: errorType) => {

    console.log(error)
    let valuesString = Object.entries(error?.data)
        .map(([key, value]) => `${key}:${value}`)
        .join(', ');
    if (error.status === 500 ) {
        valuesString = 'Internal Server Error';
    }
    toast.push(
        <Notification
            title={'Ошибка'}
            type={'danger'}
        >
            <span>Произошла ошибка</span>
            <p>{valuesString}</p>
        </Notification>,
    )
}