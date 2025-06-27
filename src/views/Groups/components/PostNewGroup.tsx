import React, {useState} from 'react';
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import RtkQueryService from "@/services/RtkQueryService";
import {useForm} from "react-hook-form";
import {response} from "@/@types/response";
import {groups} from "@/@types/group";
import { student } from '@/@types/student';
import { employee } from '@/@types/employee';
import { Dialog, DialogContent, MenuItem, Select } from '@mui/material';
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {DatePicker} from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import formatNumber from "@/helpers/formatNumber";



type groupWIthouId = {
    "id": number,
    "name": string,
    "start_date": string,
    "end_date": string,
    "price": string,
    student_ids:number[],
    teacher: number,
    department: string,
}


interface PostNewGroup {
    dialogIsOpen: boolean,
    setDialogIsOpen: (isOpen: boolean) => void,
    refetch: () => void;
    isLoading: boolean
}
const PostNewGroup = ({dialogIsOpen, setDialogIsOpen, refetch, isLoading}:PostNewGroup) => {
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

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const [dateStart, setDateStart] = useState<dayjs | undefined>(undefined);
    const [dateEnd, setDateEnd] = useState<dayjs | null>(null);
    const [selectedStds, setSelectedStds] = useState<[]>([])
    const [teacher, setTeacher] = useState<number>(0)
    const [department, setDepartment] = useState<string | null>('')
	const [price, setPrice] = useState('')
    

    // const {refetch} = RtkQueryService.useGetAllGroupsQuery(token)
    const {data: teachersData} = RtkQueryService.useGetFilteredEmployeesQuery({token, params:{department, user_type:"TEACHER"}})
    const [addNewGroup] = RtkQueryService.useAddNewGroupMutation()

    
    let edittedTeachersData = teachersData?.map((item:employee) => ({
        id:item.id,
        value: item.id,
        label: item.user.first_name + " " + item.user.last_name
    }))

    const onDialogClose = () => {
        setDialogIsOpen(false)
    }

    const {
        register,
        handleSubmit,
        setValue
    } = useForm<groups>();

    const cleanParams = (group: groups): groups => {
        return Object.fromEntries(
            Object.entries(group).filter(([_, value]) => value != null && value !== '')
        ) as groups;
    };
    
    const submit = (data:groups) => {
        setIsSubmitting(true)
	    const numericValue = Number(data.price.replace(/\s/g, ""));
        const newSelected = selectedStds.map((item:student) => item.id)
        data = {...data, student_ids:[...newSelected], price: numericValue}
        addNewGroup({ data: cleanParams(data), token })
            .then((res:response) => {
                if(res.data) {
                    setIsSubmitting(false)
                    setDialogIsOpen(false)
                    refetch()
                }
            })
    }

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const rawValue = event.target.value.replace(/\D/g, "");
		const formattedValue = formatNumber(rawValue);
		setPrice(formattedValue);
	};


  

    return (
        <Dialog
            open={dialogIsOpen}
            onClose={onDialogClose}
            fullWidth
            maxWidth='sm'
        >
            <DialogContent>
            
            <h2>Создание группы</h2>
            <form
                className={'flex flex-col gap-5 py-2'}
                onSubmit={handleSubmit(submit)}
            >
                <label className={'flex flex-col gap-1'}>
                    Выберите отдел
                    <Select
                        sx={{
                            height: '44px'
                        }}     
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
                <label className={'flex flex-col gap-1'}>
                    Название группы
                    <Input {...register('name', {required: true})} />
                </label>
                <label className={'flex flex-col gap-1'}>
                    Цена
                    <Input
	                    type={'text'}
	                    {...register('price', {required: true})}
	                    onChange={handleChange}
	                    value={price}
                    />
                </label>
                <label className={'flex flex-col gap-1'}>
                    Начало
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            {...register('start_date')}
                            sx={{
                                '& .MuiInputBase-root': {
                                    height: '44px',
                                },
                                '& .MuiOutlinedInput-root': {
                                    height: '44px',
                                },
                            }}
                            format='YYYY-M-D'
                            onChange={(newVal) => {
                                const formattedDate = dayjs(newVal).format('YYYY-MM-DD');
                                setValue('start_date', formattedDate)
                            }}
                        />
                    </LocalizationProvider>
                </label>
                <label className={'flex flex-col gap-1'}>
                    Завершение
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            {...register('end_date')}
                            sx={{
                                '& .MuiInputBase-root': {
                                    height: '44px',
                                },
                                '& .MuiOutlinedInput-root': {
                                    height: '44px',
                                },
                            }}
                            format='YYYY-M-D'
                            onChange={(newVal) => {
                                const formattedDate = dayjs(newVal).format('YYYY-MM-DD');
                                setValue('end_date', formattedDate)
                            }}
                        />
                    </LocalizationProvider>
                </label>
                <label className={'flex flex-col gap-1'}>
                    Выберите учителя
                    <Select
                        placeholder="Выберите учителя"
                        {...register('teacher', {required: true})}
                        onChange={(e) => setTeacher(e.target.value)}
                        required={true}
                        sx={{
                            height: '44px'
                        }}
                    >
                        {
                            edittedTeachersData?.map(item => <MenuItem key={item.id} value={item.value}>{item.label}</MenuItem>)
                        }
                    </Select>
                </label>

                <Button disabled={isSubmitting} type={'submit'} variant={'solid'}>{isSubmitting ? 'Создание...' : 'Создать'}</Button>
            </form>
            </DialogContent>
        </Dialog>
    )
}


export default PostNewGroup;