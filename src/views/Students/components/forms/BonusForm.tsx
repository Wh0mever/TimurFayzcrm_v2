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

const BonusForm = ({studentData, setIsOpen, isOpen, refetch}: Props) => {
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
    const { refetch: refetchPayments } = RtkQueryService.useGetStudentPaymentsQuery({token, id: studentData.id})
    const [newBonus] = RtkQueryService.usePostNewBonusMutation()
	const [value, setValue] = useState('')

    const submitBonus = (data: object) => {
	    const numericValue = Number(data.amount.replace(/\s/g, ""));
        data = {...data, student: studentData.id, amount: numericValue}

        newBonus({token, data})
            .then((res: response) => {
                if(res.data){
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
    <form
        onSubmit={handleSubmit(submitBonus)}
        className={'flex flex-col gap-5 mt-3 mb-3'}

    >
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
            <span>Коментарий</span>
            <Input
                {...register('comment')}
                textArea
                type={'text'}
                style={{
                    color: 'black'
                }}
            />
        </label>
        <Button type={'submit'} variant={'solid'}>Пополнить</Button>
    </form>
  )
}

export default BonusForm