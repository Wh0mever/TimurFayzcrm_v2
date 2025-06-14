import React, {useState} from 'react';
import {useForm} from "react-hook-form";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import {employee} from "@/@types/employee";
import {HiOutlineEye, HiOutlineEyeOff} from "react-icons/hi";
import rtkQueryService from "@/services/RtkQueryService";
import {response} from "@/@types/response";
import { Dialog, DialogContent, MenuItem, Select } from '@mui/material';
import formatNumber from "@/helpers/formatNumber";


interface PostNewEmployee {
    dialogIsOpen: boolean,
    setDialogIsOpen: (isOpen: boolean) => void,
}


function PostNewEmployee({dialogIsOpen, setDialogIsOpen}: PostNewEmployee) {
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


    const [addNewEmployee] = rtkQueryService.usePostNewEmployeeMutation()
    const { refetch } = rtkQueryService.useGetAllEmployeesQuery({ token })

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const [seePass, setSeePass] = useState<boolean>(false)
    const [userType, setUserType] = useState<string>('')
    const [department, setDepartment] = useState<string>('')
	const [salary, setSalary] = useState<string>('')


    const onDialogClose = () => {
        setDialogIsOpen(false)
    }
    const {
        register,
        handleSubmit,
    } = useForm<employee>()

     const submit = (data: employee) => {
         setIsSubmitting(true)
	     const numericValue = Number(data.salary.replace(/\s/g, ""));

         const newData = {...data, user: {user_type: userType, ...data.user}, salary:numericValue,}
         addNewEmployee({token, data:newData})
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

    const onPasswordVisibleClick = (e: MouseEvent) => {
        e.preventDefault()
        setSeePass(!seePass)
    }

    const inputIcon = (
        <span
            className="cursor-pointer"
            onClick={(e) => onPasswordVisibleClick(e)}
        >
            {seePass  ? (
                <HiOutlineEyeOff />
            ) : (
                <HiOutlineEye />
            )}
        </span>
    )

    return (
        <Dialog
            open={dialogIsOpen}
            onClose={onDialogClose}
            fullWidth
        >
            <DialogContent>
            <h2 className={'mb-[20px]'}>Добавление сотрудника</h2>
            <form
                onSubmit={handleSubmit(submit)}
                className={'flex flex-col gap-[20px]'}
            >
                <label >
                    Имя
                    <Input
                        {...register('user.first_name', { required: true })}
                        type="text"
                        autoComplete="off"
                        placeholder="Имя"
                    />
                </label>
                <label>
                    Фамилия
                    <Input
                        {...register('user.last_name', { required: true })}
                        type="text"
                        autoComplete="off"
                        placeholder="Фамилия"
                    />
                </label>
                <label>
                    Имя пользователя
                    <Input
                        {...register('user.username', { required: true })}
                        type="text"
                        autoComplete="off"
                        placeholder="Имя пользователя"
                    />
                </label>
                <label>
                    Пароль
                    <Input
                        {...register('user.password', { required: true })}
                        type={seePass ? 'text' : 'password'}
                        autoComplete="off"
                        placeholder="Пароль"
                        suffix={inputIcon}
                    />
                </label>
                
               <label>
                Зарплата
                    <Input
                        {...register('salary', { required: true })}
                        type={'text'}
                        autoComplete="off"
                        placeholder="Зарплата"
                        onChange={handleChange}
                        value={salary}
                    />
               </label>
                <label className='flex flex-col gap-1' >
                Должность
                    <Select
                        sx={{height:'44px'}}
                        placeholder="Должность"
                        {...register('user.user_type', {required:true})}
                        onChange={(event) => {
                            setUserType(event.target.value)
                        }}
                        value={userType}
                        required={true}
                    >
                        <MenuItem value={'MANAGER'}>Админ</MenuItem>
                        <MenuItem value={'ACCOUNTANT'}>Бухгалтер</MenuItem>
                        <MenuItem value={'CASHIER'}>Кассир</MenuItem>
                        <MenuItem value={'TEACHER'}>Учитель</MenuItem>
                        <MenuItem value={'MANAGER'}>Менеджер</MenuItem>
                    </Select>
                </label>
                {userType === 'TEACHER' && (
                    <label className='flex flex-col gap-1'>
                        Отдел
                        <Select
                            sx={{height:'44px'}}
                            placeholder="Отдел"
                            {...register('department', {required:true})}
                            onChange={(e) => {
                                setDepartment(e.target.value)
                            }}
                            value={department}
                            required={true}
                        >
                            <MenuItem value={'SCHOOL'}>Школа</MenuItem>
                            <MenuItem value={'KINDERGARTEN'}>Дет сад</MenuItem>
                            <MenuItem value={'CAMP'}>Лагерь</MenuItem>
                        </Select>
                    </label>
                )}
                <Button
                    block
                    loading={isSubmitting}
                    variant="solid"
                    type="submit"
                >
                    {isSubmitting ? 'Добавление...' : 'Добавить'}
                </Button>
            </form>
            </DialogContent>   
        </Dialog>
    )
}

export default PostNewEmployee;