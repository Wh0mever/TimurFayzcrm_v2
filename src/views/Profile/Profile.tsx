import React, {useState} from 'react';
import rtkQueryService from "@/services/RtkQueryService";
import Tabs from '@/components/ui/Tabs'
import {Button, Input, Notification, toast, Upload} from "@/components/ui";
import {useForm} from "react-hook-form";
import {user} from "@/@types/user";
import fileToBase64 from "@/helpers/fileToBase64";
import ChangePasswordForm from "@/views/Profile/components/ChangePasswordForm";
import {response} from "@/@types/response";

const { TabNav, TabList, TabContent } = Tabs
function Profile() {
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

    const {data: user, refetch} = rtkQueryService.useGetCurrentUserQuery(token)
    const [updateInfo] = rtkQueryService.useUpdateCurrentUserMutation()
    const [deleteAvatar] = rtkQueryService.useDeleteAvatarMutation()

    const [avatar, setAvatar] = useState<File>()

    const openNotification = (
        type: 'success' | 'warning' | 'danger' | 'info'
    ) => {
        toast.push(
            <Notification
                title={type.charAt(0).toUpperCase() + type.slice(1)}
                type={type}
            >
                {type === 'success' && "Действие выполнено успешно"}
                {type === 'danger' && "Произошла ошибка"}
            </Notification>
        )
    }


    const deleteAva = () => {
        deleteAvatar({token})
            .then((res:response) => {
                if(res.data) {
                    openNotification('success')
                    refetch()
                } else {
                    openNotification('danger')
                }
            })
    }


    const handleFileChange = (file:File) => {
        if (file) {
            setAvatar(file); // Сохраняем файл
        }
    };



    const handleUpload = async () => {
        if (!avatar) {
            return;
        }

        const base64 = await fileToBase64(avatar)

        // Отправка на сервер
        updateInfo({token, data: {
            avatar: base64
            }})
            .then((res:response) => {
                if (res.data) {
                    openNotification('success')
                    refetch()
                } else {
                    openNotification('danger')
                }
            })
    };

    const {
        register,
        handleSubmit,
    } = useForm<user>()

    const submit = (data:object) => {
        if (data === user){
            return
        }
        updateInfo({token, data})
            .then((res:response) => {
                if (res.data){
                    openNotification('success')
                } else {
                    openNotification('danger')
                }
            })

    }


    return (
        <div>
            <h1 className={'mb-10'}>Настройки </h1>
            <Tabs defaultValue="tab1">
                <TabList>
                    <TabNav value="tab1">Профиль</TabNav>
                    <TabNav value="tab2">Поменять фото профиля</TabNav>
                    <TabNav value="tab3">Сменить пароль</TabNav>
                </TabList>
                <div className="p-4">
                    <TabContent value="tab1">
                        <form
                            className={'w-1/3 flex flex-col gap-3'}
                            onSubmit={handleSubmit(submit)}
                        >
                            <label>
                                <span>Имя</span>
                                <Input
                                    {...register("first_name", { required: true })}
                                    defaultValue={user?.first_name}
                                />
                            </label>
                            <label>
                                <span>Фамилия</span>
                                <Input
                                    {...register("last_name", { required: true })}
                                    defaultValue={user?.last_name}
                                />
                            </label>
                            <label>
                                <span>Имя пользователя</span>
                                <Input
                                    defaultValue={user?.username}
                                    disabled={true}
                                />
                            </label>
                            <Button
                                variant={'solid'}
                                type={'submit'}
                            >
                                Сохранить
                            </Button>
                        </form>
                    </TabContent>
                    <TabContent value="tab2" className={'flex gap-20 w-1/2'}>
                        {user?.avatar &&
                            <div className={'flex flex-col gap-4 items-center'}>
                                <img
                                    className={'w-40 h-40 rounded-full border-[1px] border-gray-300'}
                                    src={user?.avatar}
                                    alt={'avatar'}
                                />
                                <Button
                                    className={''}
                                    variant={'solid'}
                                    color={'red'}
                                    onClick={() => deleteAva()}
                                >
                                    Удалить cтарое фото
                                </Button>
                            </div>
                        }
                        <div className={'w-full flex flex-col item-center'}>
                            <Upload
                                draggable
                                style={{
                                    width:'100%',
                                    height:'100%'
                                }}
                                onChange={(event) => handleFileChange(event[0])}
                                uploadLimit={1}

                            >
                                Выберите фотографие или перетащите
                            </Upload>
                            <Button
                                onClick={() => handleUpload()}
                                className={''}
                                variant={'solid'}
                            >
                                Сохранить
                            </Button>
                        </div>
                    </TabContent>
                    <TabContent value="tab3" className={'w-1/3'}>
                        <ChangePasswordForm/>
                    </TabContent>
                </div>
            </Tabs>
        </div>
    );
}

export default Profile;