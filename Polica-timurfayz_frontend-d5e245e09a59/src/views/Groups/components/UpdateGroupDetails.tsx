import React, {useState} from 'react';
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import {useForm} from "react-hook-form";
import RtkQueryService from "@/services/RtkQueryService";
import {groups} from "@/@types/group";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, {Dayjs} from "dayjs";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {DatePicker} from "@mui/x-date-pickers/DatePicker";
import {response} from "@/@types/response";
import { useAppSelector } from '@/store';
import { Checkbox, Dialog, DialogContent, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { teacher } from '@/@types/teacher';
import utc from 'dayjs/plugin/utc';
import formatNumber from "@/helpers/formatNumber";

dayjs.extend(utc);
interface PostNewGroup {
    dialogIsOpen: boolean,
    setDialogIsOpen: (isOpen: boolean) => void,
    groupData: groups,
    refetch: () => void
}

const PostNewGroup = ({dialogIsOpen, setDialogIsOpen, groupData, refetch}:PostNewGroup) => {
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
    const [dateStart, setDateStart] = useState<null | string | undefined | Dayjs>(groupData.start_date);
    const [dateEnd, setDateEnd] = useState<null | string | undefined | Dayjs>(groupData.end_date);
    const [department, setDepartment] = useState<string>('');
	const [price, setPrice] = useState<string>(formatNumber(groupData.price));

    // const {refetch} = RtkQueryService.useGetAllGroupsQuery({token})
    const [updateGroup] = RtkQueryService.useUpdateGroupDetailsMutation()
    const {data: teachersData} = RtkQueryService.useGetFilteredEmployeesQuery({token, params: department ? {department, user_type:"TEACHER"} : {user_type:"TEACHER"}})

    const onDialogClose = () => {
        setDialogIsOpen(false)
    }

    const {
        register,
        handleSubmit,
    } = useForm({
        defaultValues: groupData,
    });

    const submit = (data:groups) => {

        const formattedStartDate = dateStart ? dayjs(dateStart).format('YYYY-MM-DD') : null;        
        const formattedEndDate = dateEnd ? dayjs(dateEnd).format('YYYY-MM-DD') : null;        
        setIsSubmitting(true)
	    const numericValue = Number(data.price.replace(/\s/g, ""));

        data = {...data, start_date:formattedStartDate, end_date:formattedEndDate, price: numericValue}
        
        updateGroup({ data, token })
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

    const {authority} = useAppSelector(
        (state) => state.auth.user
    )

    return (
        <Dialog
            open={dialogIsOpen}
            onClose={onDialogClose}
            fullWidth
            maxWidth='sm'
        >
            <DialogContent>
            {authority?.includes('MANAGER') && (
                <>
                    <h2>Исправление данных группы </h2>
                    <form
                        onSubmit={handleSubmit(submit)}
                        className={'flex flex-col gap-[20px] pt-10 text-black'}
                    >
                        <label>
                            Данные были введены не првильно
                            <Checkbox defaultChecked={groupData.marked_for_delete} {...register('marked_for_delete')} />
                        </label>
                        <Button
                            block
                            loading={isSubmitting}
                            variant="solid"
                            type="submit"
                        >
                            {isSubmitting ? 'Добавление...' : 'Добавить'}
                        </Button>
                    </form>
                </>
            )}

            {!authority?.includes('MANAGER') && (
                <>
                <h2>Изменение группы {groupData.name}</h2>
            <form
                className={'flex flex-col gap-5 py-2 text-black'}
                onSubmit={handleSubmit(submit)}
            >
                <label className={'flex flex-col gap-1'}>
                    Название группы
                    <Input
                        defaultValue={groupData.name}
                        {...register('name', {required: true})}
                    />
                </label>
                <label className={'flex flex-col gap-1'}>
                    Цена урока
                    <Input
                        {...register('price', {required: true})}
                        type={'text'}
                        onChange={handleChange}
                        value={price}
                    />
                </label>

                <label className={'flex flex-col gap-1'}>
                    Начало
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            disabled
                            sx={{
                                height:'44px'
                            }}
                            format='YYYY-M-D'
                            {...register('start_date', { required: true })}
                            onChange={(newValue) => setDateStart(newValue)}
                            defaultValue={dayjs(dateStart)}
                        />
                    </LocalizationProvider>
                </label>
                <label className={'flex flex-col gap-1'}>
                    Завершение
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            disabled
                            sx={{
                                height:'44px'
                            }}
                            format='YYYY-M-D'
                            {...register('end_date', { required: true })}
                            onChange={(newValue) => setDateEnd(newValue)}
                            defaultValue={dayjs(dateEnd)}
                            minDate={dayjs(dateStart)}
                        />
                    </LocalizationProvider>
                </label>
                <label className={'flex flex-col gap-1'}>
                    Выберите отдел
                    <Select
                        placeholder="Выберите отдел"
                        {...register('department', { required: true })}
                        onChange={(e: SelectChangeEvent) => setDepartment(e.target.value)}
                        required={true}
                        defaultValue={groupData.department}
                        sx={{
                            height:'44px'
                        }}
                    >
                        <MenuItem value={'SCHOOL'}>Школа</MenuItem>
                        <MenuItem value={'CAMP'}>Лагерь</MenuItem>
                        <MenuItem value={'KINDERGARTEN'}>Дет сад</MenuItem>
                    </Select>
                </label>
                <label className={'flex flex-col gap-1'}>
                    Выберите учителя
                    <Select
                        {...register('teacher', { required: true })}
                        placeholder="Выберите учителя"
                        required={true}
                        sx={{
                            height:'44px'
                        }}
                        defaultValue={groupData.teacher}
                    >
                        {teachersData?.map((teacher: teacher) => <MenuItem key={teacher.id} value={teacher.id}>{teacher.user.first_name} {teacher.user.last_name}</MenuItem>)}
                    </Select>
                </label>
                <Button disabled={isSubmitting} type={'submit'} variant={'solid'}>{isSubmitting ? 'Изменение...' : 'Изменить'}</Button>
            </form>
                </>
            )}
            </DialogContent>
        </Dialog>
    )
}


export default PostNewGroup;