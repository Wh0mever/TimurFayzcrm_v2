import React, {useState} from 'react';
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import {useForm} from "react-hook-form";
import {employee} from "@/@types/employee";
import rtkQueryService from "@/services/RtkQueryService";
import {response} from "@/@types/response";
import { Select } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import formatNumber from "@/helpers/formatNumber";

interface UpdateEmployeeDetails {
    setDialogIsOpen: (isOpen: boolean) => void,
    employeeData: employee
}
function UpdateForm({ employeeData, setDialogIsOpen }:UpdateEmployeeDetails) {
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



    const { register, handleSubmit } = useForm<employee>()
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const [updateEmployee] = rtkQueryService.useUpdateEmployeeDetailsMutation()
    const { refetch } = rtkQueryService.useGetAllEmployeesQuery({token})
	const [salary, setSalary] = useState(formatNumber(employeeData.salary))

    const submit = (data: employee) => {
        setIsSubmitting(true)
	    const numericValue = Number(data.salary.replace(/\s/g, ""));

        const newData = {...employeeData, ...data, user: {...data.user}, salary:numericValue,}

        updateEmployee({token, data:newData})
            .then((res:response) => {
                if(res.data) {
                    setDialogIsOpen(false)
                    refetch()
                }
            })



        setIsSubmitting(false)
    }

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const rawValue = event.target.value.replace(/\D/g, "");
		const formattedValue = formatNumber(rawValue);
		setSalary(formattedValue);
	};

    return (
        <div>
            <h2 className={'mb-[20px]'}>Изменение данных сотрудника</h2>
            <form
                onSubmit={handleSubmit(submit)}
                className={'flex flex-col gap-[20px] text-black'}
            >
                <Input
                    {...register('user.first_name', { required: true })}
                    type="text"
                    autoComplete="off"
                    placeholder="Имя"
                    defaultValue={employeeData.user.first_name}
                />
                <Input
                    {...register('user.last_name', { required: true })}
                    type="text"
                    autoComplete="off"
                    placeholder="Фамилия"
                    defaultValue={employeeData.user.last_name}
                />
                <Input
                    {...register('user.username', { required: true })}
                    type="text"
                    autoComplete="off"
                    placeholder="Имя пользователя"
                    defaultValue={employeeData.user.username}
                />
                <Input
                    {...register('salary', { required: true })}
                    type={'text'}
                    autoComplete="off"
                    placeholder="Зарплата"
                    onChange={handleChange}
                    value={salary}
                />
                <Select
                    sx={{
                        height: '44px',
                        borderRadius:'5px'
                    }}
                    defaultValue={employeeData?.user?.user_type}
                    placeholder="Должность"
                    {...register('user.user_type', { required: true })}
                    required={true}
                >
                    <MenuItem value={'MANAGER'}>Админ</MenuItem>
                    <MenuItem value={'ACCOUNTANT'}>Бухгалтер</MenuItem>
                    <MenuItem value={'CASHIER'}>Кассир</MenuItem>
                    <MenuItem value={'TEACHER'}>Учитель</MenuItem>
                    <MenuItem value={'MANAGER'}>Менеджер</MenuItem>
                </Select>
                <Button
                    block
                    loading={isSubmitting}
                    variant="solid"
                    type="submit"
                >
                    {isSubmitting ? 'Сохранение...' : 'Сохранить'}
                </Button>
            </form>
        </div>
    )
}

export default UpdateForm;