import React, {useState} from 'react'
import { payment } from '@/@types/payment';
import { response } from '@/@types/response';
import { student } from '@/@types/student';
import { Button, Input } from '@/components/ui';
import RtkQueryService from '@/services/RtkQueryService';
import { useForm } from 'react-hook-form';
import formatNumber from "@/helpers/formatNumber";

type Props = {
    studentData: student
    setIsOpen: (isOpen: boolean) => void,
    isOpen: boolean,
    refetch: () => void
}

const AdjustmentForm = ({studentData, setIsOpen, isOpen, refetch}: Props) => {
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
    const {register, handleSubmit,  } = useForm()
    const [adjustBalance] = RtkQueryService.usePostNewBalanceAdjustmentMutation()
    const {refetch: refetchPayments } = RtkQueryService.useGetStudentPaymentsQuery({token, id: studentData.id})
	const [value, setValue] = useState('')
    const submitChangeBalance = (data: object) => {
	    const numericValue = Number(data.new_balance.replace(/\s/g, ""));
        data = {...data, student: studentData.id, new_balance: numericValue}
        adjustBalance({token, data})
            .then((res: response) => {
                if(res.data){
                    refetch()
                    setIsOpen(false)
                    refetchPayments()
                }
            })

    }
	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const rawValue = event.target.value.replace(/\D/g, "");
		const formattedValue = formatNumber(rawValue);
		setValue(formattedValue);
	};
  return (
    <form
        onSubmit={handleSubmit(submitChangeBalance)}
        className={'flex flex-col gap-5 mt-3 mb-3'}

    >
        <label className={'flex flex-col gap-1'}>
            <span>Новый баланс</span>
            <Input
                {...register('new_balance',{ required: true, } )}
                type={'text'}
                style={{
                    color: 'black'
                }}
                value={value}
                onChange={handleChange}

            />
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
        <Button type={'submit'} variant={'solid'}>Изменить</Button>
    </form>
  )
}

export default AdjustmentForm