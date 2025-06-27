import React, {useState} from 'react';
import {Avatar, Button, Upload} from "@/components/ui";
import {FaUserCircle} from "react-icons/fa";
import fileToBase64 from "@/helpers/fileToBase64";
import rtkQueryService from "@/services/RtkQueryService";

interface UploadAvaProps {
    id:number | undefined,
    setIsOpen: (isOpen: boolean) => void
}

function UploadAvatar({id, setIsOpen}:UploadAvaProps) {
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

    const [uploadAvatar] = rtkQueryService.useAddStudentAvatarMutation()
    const {refetch} = rtkQueryService.useGetFilteredStudentsQuery({token})

    const [avatarImg, setAvatarImg] = useState<string | null>(null)
    const [avatarFile, setAvatarFile] = useState(null)

    const onFileUpload = (files: File[]) => {
        if(files.length > 0) {
            setAvatarImg(URL.createObjectURL(files[0]))
            setAvatarFile(files[0])
        }
    }

    const handleUpload = async () => {
        if (!avatarFile) {
            return;
        }

        const base64 = await fileToBase64(avatarFile)

        // Отправка на сервер
        uploadAvatar({token, id, data: {
                avatar_upload: base64,
            }})
            .then(res => {
                if (res.data) {
                    setIsOpen(false)
                    // openNotification('success')
                    refetch()
                } else {
                    // openNotification('danger')
                }
            })
    };

    return (
        <div className={'flex flex-col gap-2'}>
            <h2>Добавить фото студента</h2>
            <Avatar size={80} src={avatarImg as string} icon={<FaUserCircle />} />
            <Upload
                draggable
                showList={false}
                uploadLimit={1}
                onChange={onFileUpload}
            >
                <span>Выберите фото или перетащите</span>
            </Upload>
            <Button onClick={() => handleUpload()} variant={'solid'}>Сохранить</Button>
        </div>
    );
}

export default UploadAvatar;