import React, {FormEvent, useState} from 'react';
import {Button, Input} from "@/components/ui";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import {useForm} from "react-hook-form";
import {payment} from "@/@types/payment";
import rtkQueryService from "@/services/RtkQueryService";
import {outlayCategories} from "@/@types/outlayCategories";
import {categoryItem} from "@/@types/categoruItem";
import {response} from "@/@types/response";
import { Dialog, DialogContent } from '@mui/material';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import formatNumber from "@/helpers/formatNumber";

interface addTransactionProps {
    isOpen: boolean,
    setIsOpen: (isOpen: boolean) => void,
    refetch: () => void;
}

function AddTransaction({isOpen, setIsOpen, refetch}:addTransactionProps) {
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

	const [value, setValue] = useState("");
    const [date, setDate] = useState<Dayjs>(dayjs())

    const {data: categoryItems} = rtkQueryService.useGetOutlayCategoryItemsQuery({token})
    const [postNewTransaction] = rtkQueryService.usePostNewPaymentMutation()

    const {register, handleSubmit} = useForm<payment>()

    const submit = (data:payment) => {
	    const numericValue = Number(data.amount.replace(/\s/g, ""));
        data = {...data, payment_model_type: "OUTLAY", amount: numericValue}
        postNewTransaction({token, data})
            .then((res:response) => {
                if (res.data) {
                    refetch()
                    setIsOpen(false)
                }
            })
    }

    const handleDateChange = (newValue: Dayjs | null) => {
        if (newValue) {
            setDate(newValue);
            // Log or save the formatted date string if needed
            const formattedDate = newValue.format('YYYY-MM-DDTHH:mm:ss[Z]');
            console.log(formattedDate);
        }
    };

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const rawValue = event.target.value.replace(/\D/g, "");
		const formattedValue = formatNumber(rawValue);
		setValue(formattedValue);
	};

    return (
        <Dialog
            open={isOpen}
            onClose={() => setIsOpen(false)}
            fullWidth
            maxWidth='sm'
        >
            <DialogContent>
            <h3>
                Добавление транзакций
            </h3>
            <form onSubmit={handleSubmit(submit)} className={'flex flex-col gap-4 mt-5'}>
                <label className={'flex flex-col gap-1'}>
                    Дата оплаты
                    <LocalizationProvider
                        dateAdapter={AdapterDayjs}
                    >
                        <DateTimePicker
                            ampm={false}
                            {...register("payment_date", { required: true })}
                            value={date}
                            onChange={handleDateChange}
                            format='YYYY-MM-DD HH:mm'
                        />
                    </LocalizationProvider>
                </label>
                <label>
                    <span>Доход/Расход</span>
                    <Select {...register('payment_type', {required:true})} sx={{width:'100%'}}>
                        <MenuItem value={"INCOME"}>ДОХОД</MenuItem>
                        <MenuItem value={"OUTCOME"}>РАСХОД</MenuItem>
                    </Select>
                </label>
                <label>
                    <span>Метод оплаты</span>
                    <Select {...register('payment_method', {required:true})} sx={{width:'100%'}}>
                        <MenuItem value={"CASH"}>Наличные</MenuItem>
                        <MenuItem value={"CARD"}>Карта</MenuItem>
                        <MenuItem value={"TRANSFER"}>Перечисление</MenuItem>
                        <MenuItem value={"HUMO"}>HUMO</MenuItem>
                        <MenuItem value={"UZCARD"}>UZCARD</MenuItem>
                        <MenuItem value={"CLICK"}>CLICK</MenuItem>
                        <MenuItem value={"PAYME"}>PAYME</MenuItem>
                        <MenuItem value={"UZUM"}>UZUM</MenuItem>
                    </Select>
                </label>
                <label>
                    <span>Пичина доходов/расходов</span>
                    <Select {...register('outlay', {required:true})} sx={{width:'100%'}}>
                        {
                            categoryItems?.map((item:categoryItem) =>
                                <MenuItem key={item.id} value={item.id}>{item.title}</MenuItem>
                            )
                        }
                    </Select>
                </label>
                <label>
                    <span>Сумма</span>
                    <Input
                        style={{color: 'black'}}
                        {...register('amount', {required:true})}
                        value={value}
                        type="text"
                        onChange={handleChange}
                    />
                </label>
                <label className={'flex flex-col gap-1'}>
                    <span>Коментарий</span>
                    <Input
                        {...register('comment')}
                        textArea
                        type={'text'}
                        style={{
                            color: 'black'
                        }}
                    />
                </label>
                <Button variant={'solid'} type={'submit'}>Создать транзакцию</Button>
            </form>
            </DialogContent>
        </Dialog>
    );
}

export default AddTransaction;