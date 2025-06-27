import React, {useEffect, useState} from 'react';
import {Button, Dialog, Select} from "@/components/ui";
import {groups} from "@/@types/group";
import {student} from "@/@types/student";
import {useParams} from "react-router-dom";
import {response} from "@/@types/response";
import RtkQueryService from '@/services/RtkQueryService';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { Controller, useForm } from 'react-hook-form';

interface AddStudent {
    groupData: groups,
    open:boolean,
    setOpen: (isOpen: boolean) => void,
    refetch: () => void,
}

type stds = {
    id:number,
    value:string,
    label:string
}

const AddStudent = (props:AddStudent) => {
    const {groupData, open, setOpen, refetch} = props

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

    const {groupId} = useParams()
    const { refetch:refetchGroupData} = RtkQueryService.useGetGroupDetailsQuery({token, id: groupId})
    const { data: studentData , refetch:refetchStudentsList} = RtkQueryService.useGetFilteredStudentsQuery({token})
    const [addStudents] = RtkQueryService.useUpdateGroupDetailsMutation()
    const [selectedStds, setSelectedStds] = useState<[]>([])
    const [enterDate, setEnterDate] = useState<Dayjs | null>(dayjs())

    let edittedData = studentData?.map((item:student) => ({
        id:item.id,
        value:item.full_name,
        label:item.full_name
    }))

    const data1 = groupData?.students?.map((item:stds) => item.id)

    edittedData = edittedData?.filter((item:stds) => !data1.includes(item.id))

    const {register, control, handleSubmit, setValue} = useForm()


    const submit = (data) => {
        const newSelected = selectedStds.map((item:student) => item.id)
        if(selectedStds.length !== 0){
            const newData = { ...groupData, ...data, student_ids:[...newSelected, ...data1] }
            addStudents({
                data: newData,
                token
            }).then((res:response) => {
                if (res.data) {
                    refetch()
                    setOpen(false)
                }
            })
        }
    }

    const handleDateChange = (newValue: Dayjs | null) => {
        if (newValue) {
            // Log or save the formatted date string if needed
            const formattedDate = newValue.format('YYYY-MM-DD');
            console.log(formattedDate);
            return formattedDate;
        }
    };

    useEffect(() => {refetchGroupData()}, [open])

    return (
        <Dialog
            isOpen={open}
            onClose={handleSubmit(submit)}
            onRequestClose={() => setOpen(false)}
        >
            <h3 className={'mb-4'}>Добавление студентов в группу {groupData.name}</h3>
            <form
                className={'flex flex-col gap-2'}
                onSubmit={handleSubmit(submit)}
            >
                <label>
                Выберите ученика
                    <Select
                        isMulti
                        placeholder="Выберите ученика"
                        onChange={(value) => setSelectedStds(value)}
                        required={true}
                        options={edittedData}
                    />
                </label>
                <label
                    className={'w-full flex flex-col'}
                >
                    Дата добавления
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Controller
                            name="joined_date"
                            control={control}
                            defaultValue={enterDate}
                            render={({ field }) => (
                                <DatePicker
                                    {...field}
                                    value={enterDate}
                                    onChange={(newValue) => {
                                        setEnterDate(newValue);
                                        setValue('joined_date', handleDateChange(newValue));
                                    }}
                                    sx={{
                                        '& .MuiInputBase-root': {
                                            height: '44px',
                                        },
                                    }}
                                />
                            )}
                        />
                    </LocalizationProvider>
                </label>
                <Button type={'submit'} variant={'solid'}>Добавить</Button>
            </form>
        </Dialog>
    );
};


export default AddStudent;