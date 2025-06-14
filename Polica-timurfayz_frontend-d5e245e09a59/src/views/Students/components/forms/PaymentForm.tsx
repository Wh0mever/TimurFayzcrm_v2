import { payment } from '@/@types/payment';
import { response } from '@/@types/response';
import { student } from '@/@types/student';
import { Button, Input } from '@/components/ui';
import RtkQueryService from '@/services/RtkQueryService';
import { MenuItem, Select } from '@mui/material';
import {DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import React, { useState } from 'react'
import { useForm } from 'react-hook-form';
import formatNumber from "@/helpers/formatNumber";

type Props = {
    studentData: student
    setIsOpen: (isOpen: boolean) => void,
    isOpen: boolean,
    refetch: () => void
}

const PaymentForm = ({studentData, setIsOpen, isOpen, refetch}: Props) => {
    
    const adminData = localStorage.getItem("admin");
    
    let token: string | null = null;
    
    if (adminData) {
        try {
            const parsedAdmin = JSON.parse(adminData);
            const authData = JSON.parse(parsedAdmin?.auth ?? '{}'); // Handle missing `auth`
            token = authData?.session?.token ?? null; // Safely access nested properties
        } catch (error) {
            console.error("Error parsing JSON:", error);
        }
    }
    const {register, handleSubmit,  } = useForm<payment>()
    const [makePayment] = RtkQueryService.useMakeStudentPaymentMutation()
    const { data: studentPayments, refetch: refetchPayments } = RtkQueryService.useGetStudentPaymentsQuery({token, id: studentData.id})
    const [date, setDate] = useState<Dayjs | null>(dayjs())
	const [value, setValue] = useState('')

    const submit = (data:object) => {
	    const numericValue = Number(data.amount.replace(/\s/g, ""));
        data = {
            ...data,
            payment_type: 'INCOME',
            payment_model_type: "STUDENT",
            student: studentData.id,
            payment_date: date,
	        amount: numericValue,
        }
        makePayment({token, data})
            .then((res:response) => {
                if (res.data) {
                    refetchPayments()
                    refetch()
                    setIsOpen(false)
                }
            })
    }
	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const rawValue = event.target.value.replace(/\D/g, "");
		const formattedValue = formatNumber(rawValue);
		setValue(formattedValue);
	};

    return (
    <div>
        <form
            onSubmit={handleSubmit(submit)}
            className={'flex flex-col gap-5 mt-3 mb-3'}
        >
            <label className={'flex flex-col gap-1'}>
                <span>Метод оплаты</span>
                <Select
                    {...register('payment_method', { required: true })}
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    placeholder="Метод оплаты"
                    sx={{
                        height: '44px',
                        border: '#D1D5DB',
                        outline: ' none',
                        borderRadius: '5px',
                    }}
                >
                    <MenuItem value={"CASH"}>Наличные</MenuItem>
                    <MenuItem value={"CARD"}>Карта</MenuItem>
                    <MenuItem value={"TRANSFER"}>Перечисление</MenuItem>
                    <MenuItem value={"HUMO"}>HUMO</MenuItem>
                    <MenuItem value={"UZCARD"}>UZCARD</MenuItem>
                    <MenuItem value={"CLICK"}>CLICK</MenuItem>
                    <MenuItem value={"PAYME"}>PAYME</MenuItem>
                    <MenuItem value={"UZUM"}>UZUM</MenuItem>
                </Select>
            </label>
            <label className={'flex flex-col gap-1'}>
                <span>Сумма</span>
                <Input
                    {...register('amount',{ required: true, } )}
                    value={value}
                    type="text"
                    onChange={handleChange}
                    style={{
                        color: 'black'
                    }}
                />
            </label>
            <label className={'flex flex-col gap-1'}>
                Дата оплаты
                <LocalizationProvider
                    dateAdapter={AdapterDayjs}
                    adapterLocale='zh-cn'
                >
                    <DateTimePicker
						ampm={false}
                        {...register("payment_date", { required: true })}
                        value={date}
                        onChange={(newValue) => setDate(newValue)}              
                    />
                </LocalizationProvider>
            </label>
            <label className={'flex flex-col gap-1'}>
                <span>Коментарий</span>
                <Input
                    {...register('comment')}
                    textArea
                    type={'number'}
                    style={{
                        color: 'black'
                    }}
                />
            </label>
            <Button type={'submit'} variant={'solid'}>Пополнить</Button>
        </form>
    </div>
    )
}

export default PaymentForm