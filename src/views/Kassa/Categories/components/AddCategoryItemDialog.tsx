import React from 'react';
import {Button, Input} from "@/components/ui";
import {useForm} from "react-hook-form";
import rtkQueryService from "@/services/RtkQueryService";
import {response} from "@/@types/response";
import { Dialog, DialogContent } from '@mui/material';

interface AddCategoryProps {
    isOpen: boolean,
    setIsOpen: (isOpen: boolean) => void,
    id:number
}

function AddCategoryItemDialog({ isOpen, setIsOpen, id }:AddCategoryProps) {
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

    const {register, handleSubmit} = useForm()
    const [postNewCategory] = rtkQueryService.usePostNewOutlayCategoryItemMutation()
    const {refetch} = rtkQueryService.useGetOutlayCategoryItemsQuery({token, id})

    const submit = (data:object) => {
        postNewCategory({token, data: {...data, category: id}})
            .then((res: response) => {
                if (res.data) {
                    refetch()
                    setIsOpen(false)
                }
            })
    }

    return (
        <Dialog
            open={isOpen}
            onClose={() => setIsOpen(false)}
            fullWidth
            maxWidth='sm'
        >
            <DialogContent>
            <h3>Создать причину</h3>
            <form
                className={'flex flex-col  gap-4 mt-4'}
                onSubmit={handleSubmit(submit)}
            >
                <label>
                    <span>
                        Название причины
                    </span>
                    <Input
                        {...register('title', {required:true})}
                        type={'text'}
                        placeholder={'Название причины'}
                    />
                </label>
                <Button type={'submit'} variant={'solid'}>Создать</Button>
            </form>
            </DialogContent>
        </Dialog>
    )
}

export default AddCategoryItemDialog;