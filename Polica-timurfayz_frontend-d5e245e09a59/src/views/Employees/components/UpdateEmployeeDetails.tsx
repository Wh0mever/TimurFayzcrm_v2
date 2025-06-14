import React, {useState} from 'react';
import {employee} from "@/@types/employee";
import {Select, Switcher, Tabs} from "@/components/ui";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import {useForm} from "react-hook-form";
import rtkQueryService from "@/services/RtkQueryService";
import employees from "@/views/Employees/Employees";
import TabList from "@/components/ui/Tabs/TabList";
import TabNav from "@/components/ui/Tabs/TabNav";
import TabContent from "@/components/ui/Tabs/TabContent";
import UpdateForm from "@/views/Employees/components/UpdateForm";
import {HiOutlineEye, HiOutlineEyeOff} from "react-icons/hi";
import {response} from "@/@types/response";
import { Dialog, DialogContent } from '@mui/material';

interface UpdateEmployeeDetails {
    dialogIsOpen: boolean,
    setDialogIsOpen: (isOpen: boolean) => void,
    employeeData: employee
}

type passes = {
    password: string,
    password2: string,
}

function UpdateEmployeeDetails({ dialogIsOpen, setDialogIsOpen, employeeData }:UpdateEmployeeDetails) {
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


    const [checked, setChecked] = useState(employeeData.user.is_active)
    const [seePass, setSeePass] = useState<boolean>(false)
    const [error, setError] = useState<string>('')
    const { register, handleSubmit } = useForm<employee | passes>()

    const [activateEmployee] = rtkQueryService.useActivateEmployeeMutation()
    const [deactivateEmployee] = rtkQueryService.useDeactivateEmployeeMutation()
    const [changePassword] = rtkQueryService.useChangeEmployeePasswordMutation()
    const { refetch } = rtkQueryService.useGetAllEmployeesQuery({token})

    const onSwitcherToggle = (val: boolean) => {
        setChecked(!val)
    }

    const changeAct = () => {
        if (checked === employeeData.user.is_active) {
            return
        }
        if(employeeData.user.is_active) {
            deactivateEmployee({token, id: employeeData.id})
                .then(() => {
                    refetch()
                    setDialogIsOpen(false)
                })
        } else {
            activateEmployee({token, id: employeeData.id})
                .then(() => {
                    refetch()
                    setDialogIsOpen(false)
                })
        }
    }

    const submit = (data:passes) => {
        if (data.password !== data.password2){
            setError('Пароли должны быть одинаковыми!')
            return
        }
        changePassword({token, data, id: employeeData.id})
            .then((res:response) => {
                if (res.data) {
                    refetch()
                    setDialogIsOpen(false)
                }
            })
    }




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
            onClose={() => setDialogIsOpen(false)}
            fullWidth
            maxWidth='sm'
        >
            <DialogContent>
            <Tabs defaultValue="tab1">
                <TabList>
                    <TabNav value="tab1">Данные</TabNav>
                    <TabNav value="tab2">Активность</TabNav>
                    <TabNav value="tab3">Пароль</TabNav>
                </TabList>
                <div className="p-4">
                    <TabContent value="tab1">
                        <UpdateForm employeeData={employeeData} setDialogIsOpen={setDialogIsOpen} />
                    </TabContent>
                    <TabContent value="tab2">
                        <h2>Изменить активность сотрудника</h2>
                        <div className={'flex gap-2 items-center my-10'}>
                            <span>Неактивный</span>
                            <Switcher checked={checked} onChange={onSwitcherToggle} />
                            <span>Активный</span>
                        </div>
                        <Button
                            block
                            variant="solid"
                            onClick={changeAct}
                        >
                            {'Сохранить'}
                        </Button>
                    </TabContent>
                    <TabContent value="tab3">
                        <h1>Изменение пароля</h1>
                        <form
                            onSubmit={handleSubmit(submit)}
                            className={'flex flex-col gap-3 mt-5' }
                        >
                            <Input
                                {...register('password', { required: true })}
                                type={seePass ? 'text' : 'password'}
                                autoComplete="off"
                                placeholder="Пароль"
                                suffix={inputIcon}
                            />
                            <Input
                                {...register('password2', { required: true })}
                                type={seePass ? 'text' : 'password'}
                                autoComplete="off"
                                placeholder="Подтвердите пароль"
                                suffix={inputIcon}
                            />
                            {error && <span className={'text-red-500'}>{error}</span>}
                            <Button
                                block
                                variant="solid"
                                type="submit"
                            >
                                {'Сохранить'}
                            </Button>
                        </form>
                    </TabContent>
                </div>
            </Tabs>
            </DialogContent>
        </Dialog>
    )
}

export default UpdateEmployeeDetails;