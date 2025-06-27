import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Upload, Tabs, toast, Notification, Spinner } from '@/components/ui'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { Controller, useForm } from 'react-hook-form'
import RtkQueryService from '@/services/RtkQueryService'
import fileToBase64 from '@/helpers/fileToBase64'
import { response } from '@/@types/response'
import TabContent from '@/components/ui/Tabs/TabContent'
import TabNav from '@/components/ui/Tabs/TabNav'
import TabList from '@/components/ui/Tabs/TabList'
import Webcam from 'react-webcam'
import { Avatar, Box, Dialog, DialogContent, TextField } from '@mui/material'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import { groups } from '@/@types/group'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs, { Dayjs } from 'dayjs'

type student = {
    full_name: string
    gender: string
    phone_number: string
    parent_phone_number: string
    birthday_date: string
    comment: string
    department: string
    group_ids: number
    joined_date: string
    account_number: string
}

interface PostNewStudent {
    dialogIsOpen: boolean
    setDialogIsOpen: (isOpen: boolean) => void
    refetch?: () => void
    isLoading: boolean
}
const PostNewStudent = ({
    dialogIsOpen,
    setDialogIsOpen,
    refetch,
    isLoading,
}: PostNewStudent) => {
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const [avatar, setAvatar] = useState('')
    const [group, setGroup] = useState(0)
    const [hasPhoto, setHasPhoto] = useState(false)
    const [isCaptured, setIsCaptured] = useState(false)
    const [date, setDate] = useState<Dayjs | null>()
    const [enterDate, setEnterDate] = useState<Dayjs | null>(dayjs())
    const [department, setDepartment] = useState<string | undefined>('')

    const adminData = localStorage.getItem('admin')

    let token: string | null = null

    if (adminData) {
        try {
            const parsedAdmin = JSON.parse(adminData)
            const authData = JSON.parse(parsedAdmin?.auth ?? '{}') // Handle missing `auth`
            token = authData?.session?.token ?? null // Safely access nested properties
        } catch (error) {
            console.error('Error parsing JSON:', error)
        }
    }
    const {
        register,
        handleSubmit,
        control,
        setValue,
        formState: { errors },
    } = useForm<student>()

    const [addNewStudent] = RtkQueryService.useAddNewStudentMutation()
    // const { } = RtkQueryService.useGetFilteredStudentsQuery({token, params: ''})
    const {
        data: groups,
        refetch: refetchGroups,
        isLoading: getGroupLoading,
    } = RtkQueryService.useGetAllGroupsQuery({ params: { department } })

    const phoneRegex = /^\+?[1-9]{1}[0-9]{1,11}$/

    const [avatarImg, setAvatarImg] = useState<string | null>(null)
    const [avatarBase64, setAvatarBase64] = useState<
        string | ArrayBuffer | null
    >('')
    const [selectedTab, setSelctedTab] = React.useState<string>('tab1')

    const onFileUpload = async (files: File[]) => {
        if (files.length > 0) {
            setAvatarImg(URL.createObjectURL(files[0]))
            const base64 = await fileToBase64(files[0])
            setAvatarBase64(base64)
            setHasPhoto(true)
        }
    }

    const onDialogClose = () => {
        0
        setDialogIsOpen(false)
    }

    const openNotification = (
        type: 'success' | 'warning' | 'danger' | 'info',
    ) => {
        toast.push(
            <Notification
                title={type.charAt(0).toUpperCase() + type.slice(1)}
                type={type}
            >
                {type === 'success' && 'Усепшно'}
                {type === 'danger' && 'Ошибка'}
            </Notification>,
        )
    }

    const handleDateChange = (newValue: Dayjs | null) => {
        if (newValue) {
            // Log or save the formatted date string if needed
            const formattedDate = newValue.format('YYYY-MM-DD')
            console.log(formattedDate)
            return formattedDate
        }
    }

    const submit = (data: student) => {
        const dateObject = dayjs(date) // `date` is the value you get from the DatePicker
        const formattedDate = dateObject.format('YYYY-MM-DD')

        setIsSubmitting(true)
        const birthday_date = formattedDate
        addNewStudent({
            data: hasPhoto
                ? {
                      avatar_upload:
                          selectedTab === 'tab1' ? avatar : avatarBase64,
                      ...data,
                      birthday_date,
                      joined_date: handleDateChange(enterDate),
                  }
                : {
                      ...data,
                      birthday_date,
                      joined_date: handleDateChange(enterDate),
                  },
            token,
        }).then((res: response) => {
            if (res.data) {
                openNotification('success')
                // refetch()
                refetchGroups()
                setDialogIsOpen(false)
            } else {
                openNotification('danger')
            }
        })

        setIsSubmitting(false)
    }

    //PHOTO
    const getActiveDevice = () => {
        return window.localStorage.getItem('activeCamDevice')
    }

    const setActiveDevice = (value: string) => {
        return window.localStorage.setItem('activeCamDevice', value)
    }

    const [deviceId, setDeviceId] = useState({})
    const [devices, setDevices] = useState([])
    const [activeDeviceId, setActiveDeviceId] = useState(getActiveDevice())

    const handleDevices = useCallback(
        (mediaDevices: []) =>
            setDevices(
                mediaDevices.filter(({ kind }) => kind === 'videoinput'),
            ),
        [setDevices],
    )

    const webcamRef = useRef(null)

    const videoConstraints = {
        width: 500,
        height: 500,
        deviceId: activeDeviceId ? activeDeviceId : deviceId,
    }

    const capture = useCallback(() => {
        const imageSrc = webcamRef?.current?.getScreenshot()

        setAvatar(imageSrc)
        setIsCaptured(true)
        setHasPhoto(true)
    }, [webcamRef])

    const requestCameraAccess = useCallback(() => {
        navigator.mediaDevices
            .getUserMedia({ video: true })
            .then((stream) => {
                navigator.mediaDevices.enumerateDevices().then(handleDevices)
                stream.getTracks().forEach((track) => track.stop())
            })
            .catch((error) => {
                console.error('Error accessing media devices:', error)
                alert('Error accessing media devices: ' + error.message)
            })
    }, [handleDevices])

    useEffect(() => {
        requestCameraAccess()
    }, [requestCameraAccess])

    return (
        <Dialog
            open={dialogIsOpen}
            onClose={onDialogClose}
            fullWidth={true}
            maxWidth={'md'}
        >
            <DialogContent>
                <h2 className={'mb-[20px]'}>Добавление студента</h2>
                {isLoading && getGroupLoading ? (
                    <Spinner />
                ) : (
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
                            />
                        </label>
                        <label>
                            Лиц. Счет(номер договора)
                            <Input
                                {...register('account_number')}
                                type="number"
                                autoComplete="off"
                                placeholder="Лиц. Счет(номер договора)"
                            />
                        </label>
                        <div className={'flex justify-between gap-[20px]'}>
                            <label className={'w-full'}>
                                Номер телефона
                                <Input
                                    {...register('phone_number', {
                                        required:
                                            'Неверный формат номера телефона',
                                        pattern: {
                                            value: phoneRegex,
                                            message:
                                                'Неверный формат номера телефона',
                                        },
                                    })}
                                    type="number"
                                    autoComplete="off"
                                    placeholder="Номер телефона"
                                />
                                {errors.phone_number && (
                                    <span className={'text-red-500'}>
                                        {errors.phone_number.message}
                                    </span>
                                )}
                            </label>
                            <label className={'w-full'}>
                                Доп. номер телефона
                                <Input
                                    {...register('parent_phone_number', {
                                        pattern: {
                                            value: phoneRegex,
                                            message:
                                                'Неверный формат номера телефона',
                                        },
                                    })}
                                    type="number"
                                    autoComplete="off"
                                    placeholder="Номер телефона родителей"
                                />
                                {errors.parent_phone_number && (
                                    <span className={'text-red-500'}>
                                        {errors.parent_phone_number.message}
                                    </span>
                                )}
                            </label>
                        </div>
                        <div className={'flex justify-between gap-[20px]'}>
                            <label className={'w-full flex flex-col'}>
                                Пол
                                <Select
                                    sx={{
                                        height: '44px',
                                        borderRadius: '5px',
                                    }}
                                    {...register('gender', { required: true })}
                                    placeholder="Пол"
                                >
                                    <MenuItem value={'MALE'}>Мальчик</MenuItem>
                                    <MenuItem value={'FEMALE'}>
                                        Девочка
                                    </MenuItem>
                                </Select>
                            </label>
                            <label className={'w-full flex flex-col'}>
                                Дата рождения
                                <LocalizationProvider
                                    sx={{
                                        height: '44px',
                                    }}
                                    dateAdapter={AdapterDayjs}
                                >
                                    <DatePicker
                                        {...register('birthday_date')}
                                        value={date}
                                        onChange={(newValue) =>
                                            setDate(newValue)
                                        }
                                        sx={{
                                            '& .MuiInputBase-root': {
                                                height: '44px',
                                            },
                                        }}
                                        format="YYYY-MM-DD"
                                    />
                                </LocalizationProvider>
                            </label>
                        </div>
                        <div className="flex w-full justify-between gap-[20px] items-center">
                            <label className="flex flex-col w-full">
                                Отдел
                                <Select
                                    fullWidth
                                    sx={{ height: '44px' }}
                                    placeholder="Отдел"
                                    {...register('department', {
                                        required: true,
                                    })}
                                    onChange={(e) => {
                                        setDepartment(e.target.value)
                                    }}
                                    value={department}
                                    required={true}
                                >
                                    <MenuItem value={'SCHOOL'}>Школа</MenuItem>
                                    <MenuItem value={'KINDERGARTEN'}>
                                        Дет сад
                                    </MenuItem>
                                    <MenuItem value={'CAMP'}>Лагерь</MenuItem>
                                </Select>
                            </label>
                            <label className=" w-full">
                                Группа
                                <Select
                                    fullWidth
                                    sx={{
                                        height: '44px',
                                        borderRadius: '5px',
                                    }}
                                    {...register('group')}
                                    className={'w-full'}
                                    placeholder="Отдел"
                                    onChange={(e) => setGroup(e.target.value)}
                                >
                                    {groups?.length <= 0 && <MenuItem>Нет групп</MenuItem>}
                                    {(groups?.results || groups)?.map((group: groups) => (
                                        <MenuItem value={group.id}>
                                            {group.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </label>
                        </div>
                        {group !== 0 && (
                            <label className={'w-full flex flex-col'}>
                                Дата добавления
                                <LocalizationProvider
                                    dateAdapter={AdapterDayjs}
                                >
                                    <Controller
                                        name="joined_date"
                                        control={control}
                                        defaultValue={enterDate}
                                        render={({ field }) => (
                                            <DatePicker
                                                {...field}
                                                value={enterDate}
                                                onChange={(newValue) => {
                                                    setEnterDate(newValue)
                                                    setValue(
                                                        'joined_date',
                                                        handleDateChange(
                                                            newValue,
                                                        ),
                                                    )
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
                        )}
                        <label>
                            Коментарий
                            <Input
                                {...register('comment')}
                                type="text"
                                autoComplete="off"
                                placeholder="Коментарий"
                                textArea
                            />
                        </label>
                        <Tabs defaultValue={'tab1'} onChange={setSelctedTab}>
                            <TabList>
                                <TabNav value="tab1">Сфотографировать</TabNav>
                                <TabNav value="tab2">Загрузить фото</TabNav>
                            </TabList>
                            <TabContent value={'tab1'} className={'pt-4'}>
                                <div
                                    className={
                                        'founded-full overflow-hidden flex flex-col items-left gap-2'
                                    }
                                >
                                    {!avatar && (
                                        <Box
                                            sx={{
                                                width: 150,
                                                height: 150,
                                                borderRadius: '100%',
                                            }}
                                        >
                                            <Webcam
                                                mirrored
                                                audio={false}
                                                height={150}
                                                ref={webcamRef}
                                                screenshotFormat="image/jpeg"
                                                width={150}
                                                videoConstraints={
                                                    videoConstraints
                                                }
                                                style={{ borderRadius: '100%' }}
                                            ></Webcam>
                                        </Box>
                                    )}

                                    {avatar && (
                                        <Avatar
                                            alt="Avatar 1"
                                            src={avatar}
                                            sx={{
                                                width: 150,
                                                height: 150,
                                                border: '1px dashed',
                                            }}
                                        />
                                    )}

                                    {!avatar && (
                                        <Button
                                            className={'w-fit'}
                                            variant={'solid'}
                                            onClick={capture}
                                            type="button"
                                        >
                                            Cфотографировать
                                        </Button>
                                    )}

                                    {avatar && (
                                        <Button
                                            className={'w-fit'}
                                            variant={'solid'}
                                            onClick={() => {
                                                setAvatar('')
                                                setIsCaptured(false)
                                            }}
                                            type="button"
                                        >
                                            Переснять
                                        </Button>
                                    )}
                                    <label className={'flex flex-col'}>
                                        <span>Выберите устройство</span>
                                        <Select
                                            sx={{ width: 'fit-content' }}
                                            placeholder="Выберите устройство"
                                            defaultValue={
                                                activeDeviceId || undefined
                                            }
                                            onChange={(
                                                e: SelectChangeEvent,
                                            ) => {
                                                setActiveDeviceId(
                                                    e.target.value,
                                                )
                                                setActiveDevice(e.target.value)
                                                setDeviceId(e.target.value)
                                            }}
                                        >
                                            {devices &&
                                                devices.map((device, key) => (
                                                    <MenuItem
                                                        value={device.deviceId}
                                                        key={key}
                                                    >
                                                        {device.label}
                                                    </MenuItem>
                                                ))}

                                            {devices.length === 0 && (
                                                <p>Устройства не найдены</p>
                                            )}
                                        </Select>
                                    </label>
                                </div>
                            </TabContent>
                            <TabContent value={'tab2'} className={'pt-4'}>
                                <div className={'flex gap-2 w-full'}>
                                    {avatarImg && (
                                        <img
                                            alt="Avatar 1"
                                            src={avatarImg as string}
                                            style={{
                                                width: 150,
                                                height: 150,
                                                border: '1px dashed',
                                                borderRadius: '100%',
                                            }}
                                        />
                                    )}
                                    <Upload
                                        draggable
                                        showList={false}
                                        uploadLimit={1}
                                        onChange={onFileUpload}
                                        style={{ width: '100%' }}
                                    >
                                        <span>
                                            Выберите фото или перетащите
                                        </span>
                                    </Upload>
                                </div>
                            </TabContent>
                        </Tabs>
                        <Button
                            block
                            loading={isSubmitting}
                            variant="solid"
                            type="submit"
                        >
                            {isSubmitting ? 'Добавление...' : 'Добавить'}
                        </Button>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    )
}

export default PostNewStudent
