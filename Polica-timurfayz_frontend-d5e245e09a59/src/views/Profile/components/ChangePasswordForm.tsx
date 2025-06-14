import React, {useState} from 'react';
import {Button, Input, Notification, toast} from "@/components/ui";
import {HiOutlineEye, HiOutlineEyeOff} from "react-icons/hi";
import rtkQueryService from "@/services/RtkQueryService";
import {useForm} from "react-hook-form";
import {response} from "@/@types/response";

type passwords = {
    password: string,
    password2:string
}

function ChangePasswordForm() {
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

    const [changePassword] = rtkQueryService.useChangeUserPasswordMutation()

    const [seePass, setSeePass] = useState<boolean>(false)
    const [error, setError] = useState<string>('')

    const openNotification = (
        type: 'success' | 'warning' | 'danger' | 'info'
    ) => {
        toast.push(
            <Notification
                title={type.charAt(0).toUpperCase() + type.slice(1)}
                type={type}
            >
                Действие успешно выполнено
            </Notification>
        )
    }



    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm()


    const submitPassword = (data:passwords) => {
        if (data.password !== data.password2){
            setError('Пароли должны быть одинаковыми!')
            return
        }
        changePassword({token, data})
            .then((res:response) => {
                if (res.data) {
                    openNotification('success')
                    reset()
                } else {
                    openNotification('danger')
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
        <div>
            <h1>Изменение пароля</h1>
            <form
                onSubmit={handleSubmit(submitPassword)}
                className={'flex flex-col gap-3 mt-3' }
            >
                <Input
                    {...register('password', {
                        required: 'Password is required',
                        pattern: {
                            value: /^[A-Za-z]+$/,
                            message: 'Пароль должен быть на латинице'
                        }
                    })}
                    type={seePass ? 'text' : 'password'}
                    autoComplete="off"
                    placeholder="Пароль"
                    suffix={inputIcon}
                />
                {errors.password && <span className={'text-red-500'}>{errors.password.message}</span>}

                <Input
                    {...register('password2', {
                        required: 'Please confirm your password',
                        pattern: {
                            value: /^[A-Za-z]+$/,
                            message: 'Пароль должен быть на латинице'
                        }
                    })}
                    type={seePass ? 'text' : 'password'}
                    autoComplete="off"
                    placeholder="Подтвердите пароль"
                    suffix={inputIcon}
                />
                {errors.password2 && <span className={'text-red-500'}>{errors.password2.message}</span>}
                {error && <span className={'text-red-500'}>{error}</span>}
                <Button
                    block
                    variant="solid"
                    type="submit"
                >
                    {'Сохранить'}
                </Button>
            </form>
        </div>
    );
}

export default ChangePasswordForm;