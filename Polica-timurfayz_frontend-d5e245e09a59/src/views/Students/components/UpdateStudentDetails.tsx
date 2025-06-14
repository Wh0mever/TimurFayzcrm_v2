import React, {useState} from 'react';
import {Tabs} from "@/components/ui";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import {useForm} from "react-hook-form";
import RtkQueryService from "@/services/RtkQueryService";
import {student} from "@/@types/student";
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from "dayjs";
import TabContent from "@/components/ui/Tabs/TabContent";
import TabList from "@/components/ui/Tabs/TabList";
import TabNav from "@/components/ui/Tabs/TabNav";
import UploadAvatar from "@/views/Students/components/UploadAvatar";
import {response} from "@/@types/response";
import { useAppSelector } from '@/store';
import { Checkbox, Dialog, DialogContent } from '@mui/material';


interface PostNewStudent {
    dialogIsOpen: boolean,
    setDialogIsOpen: (isOpen: boolean) => void,
    studentData: student,
    refetch: () => void;
}
const PostNewStudent = ({dialogIsOpen, setDialogIsOpen, studentData, refetch}:PostNewStudent) => {
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const [gender, setGender] = useState<string | undefined>(studentData?.gender)
    const [department, setDepartment] = useState<string | undefined>(studentData?.department)
    const [date, setDate] = useState<dayjs.Dayjs | null>(null)
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

    const phoneRegex = /^\+?[1-9]{1}[0-9]{1,11}$/

    const [updateStudent] = RtkQueryService.useUpdateStudentDetailsMutation()
    // const { refetch } = RtkQueryService.useGetFilteredStudentsQuery({token, params:''})

    const onDialogClose = () => {
        setDialogIsOpen(false)
    }
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<student>()

    const submit = (data:student) => {

        setIsSubmitting(true)
        updateStudent({
            data: {...data, gender: gender, id:studentData.id,},
            token
        })
        .then((res:response) => {
            // if(res.data) {
                refetch()
                setDialogIsOpen(false)
                
            // }


        })
        setIsSubmitting(false)
    }

    const {authority} = useAppSelector(
        (state) => state.auth.user
    )


    return (
        <Dialog
            open={dialogIsOpen}
            onClose={onDialogClose}
            fullWidth
            maxWidth='md'
        >
            <DialogContent>
            {authority?.includes("MANAGER") && (
                <form
                    onSubmit={handleSubmit(submit)}
                    className={'flex flex-col gap-[20px] text-black'}
                >
                    <h3 className={'mb-[20px]'}>Исправление данных студента</h3>
                    <label>
                        Данные были введены не првильно
                        <Checkbox defaultChecked={studentData.marked_for_delete} {...register('marked_for_delete')} />
                    </label>
                    <label>
                        Коментарий
                            <Input
                                {...register('comment')}
                                type="text"
                                autoComplete="off"
                                placeholder="Коментарий"
                                textArea
                                defaultValue={studentData.comment}
                            />
                        </label>
                    <Button
                        block
                        loading={isSubmitting}
                        variant="solid"
                        type="submit"
                    >
                        {isSubmitting ? 'Сохранение...' : 'Сохранить'}
                    </Button>
                </form>
            )}
            {!authority?.includes("MANAGER") && (
                <Tabs defaultValue={'tab1'}>
                <TabList>
                    <TabNav value="tab1">Изменить данные</TabNav>
                    <TabNav value="tab2">Добавить фото</TabNav>
                </TabList>
                <TabContent value={'tab1'} className={'pt-[12px]'}>
                    <h2 className={'mb-[20px]'}>Изменить данные студента</h2>
                    <form
                        onSubmit={handleSubmit(submit)}
                        className={'flex flex-col gap-[20px] text-black'}
                    >
                        <label>
                            Ф.И.О
                            <Input
                                {...register('full_name', { required: true })}
                                type="text"
                                autoComplete="off"
                                placeholder="Ф.И.О"
                                defaultValue={studentData.full_name}
                            />
                        </label>
                        <label>
                            Лиц. Счет(номер договора)
                            <Input
                                {...register('account_number', { required: true })}
                                type="text"
                                autoComplete="off"
                                placeholder="Лиц. Счет(номер договора)"
                                defaultValue={studentData.account_number}
                            />
                        </label>
                        <label className='flex flex-col'>
                            Пол
                            <Select
                                {...register('gender', { required: true })}
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={gender}
                                placeholder="Пол"
                                defaultValue={studentData.gender}
                                onChange={(event) => setGender(event.target.value)}
                                sx={{
                                    height: '44px',
                                    border: '#D1D5DB',
                                    outline: ' none',
                                    borderRadius: '5px',
                                }}
                            >
                                <MenuItem value={'MALE'}>Мальчик</MenuItem>
                                <MenuItem value={'FEMALE'}>Девочка</MenuItem>
                            </Select>
                        </label>
                        <label>
                            Номер телефона
                            <Input
                                {...register('phone_number', {
                                    required: 'Неверный формат номера телефона',
                                    pattern: {
                                        value: phoneRegex,
                                        message: 'Неверный формат номера телефона',
                                    },
                                })}
                                type="text"
                                autoComplete="off"
                                placeholder="Номер телефона"
                                defaultValue={studentData.phone_number}
                            />
                            {errors.phone_number && (
                                <span className={'text-red-500'}>
                                    {errors.phone_number.message}
                                </span>
                            )}
                        </label>
                        <label>
                        Доп. номер телефона
                            <Input
                                {...register('parent_phone_number')}
                                type="text"
                                autoComplete="off"
                                placeholder="Доп. номер телефона"
                                defaultValue={studentData.parent_phone_number}
                            />
                            {errors.parent_phone_number && (
                                <span className={'text-red-500'}>
                        {errors.parent_phone_number.message}
                    </span>
                            )}
                        </label>
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
                        <label className='flex flex-col' >
                            Дата рождения
                            <LocalizationProvider
                                dateAdapter={AdapterDayjs}
                            >
                                <DatePicker
                                    format="YYYY-M-D"
                                    {...register("birthday_date", { required: true })}
                                    onChange={(newValue) => setDate(newValue)}
                                    value={date}
                                    defaultValue={dayjs(studentData.birthday_date)}
                                    
                                />
                            </LocalizationProvider>
                        </label>
                        <label>
                        Коментарий
                            <Input
                                {...register('comment')}
                                type="text"
                                autoComplete="off"
                                placeholder="Коментарий"
                                textArea
                                defaultValue={studentData.comment}
                            />
                        </label>
                        <label>
                            Данные были введены непрвильно
                            <Checkbox  defaultChecked={studentData.marked_for_delete} {...register('marked_for_delete')} />
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
                </TabContent>
                <TabContent value={'tab2'} className={'pt-[12px]'}>
                    <UploadAvatar id={studentData?.id} setIsOpen={setDialogIsOpen}/>
                </TabContent>
            </Tabs>
            )}
            </DialogContent>
        </Dialog>
    )
}


export default PostNewStudent;