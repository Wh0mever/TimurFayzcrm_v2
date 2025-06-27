import React, { useState } from 'react';
import {Button, Input} from "@/components/ui";
import {useForm} from "react-hook-form";
import rtkQueryService from "@/services/RtkQueryService";
import {response} from "@/@types/response";
import { Dialog, DialogContent, MenuItem, Select, SelectChangeEvent } from '@mui/material';

interface AddCategoryProps {
    isOpen: boolean,
    setIsOpen: (isOpen: boolean) => void
}

function AddCategoryDialog({ isOpen, setIsOpen }:AddCategoryProps) {
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
    const [postNewCategory] = rtkQueryService.usePostNewOutlayCategoryMutation()
    const {refetch} = rtkQueryService.useGetAllOutlayCategoriesQuery({token})
    const [department, setDepartment] = useState<string>('')

    const submit = (data:object) => {
        postNewCategory({token, data})
            .then((res:response) => {
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
            <h3>Создать категорию</h3>
            <form
                className={'flex flex-col  gap-4 mt-4'}
                onSubmit={handleSubmit(submit)}
            >
                <label>
                    <span>
                        Название категории
                    </span>
                    <Input
                        {...register('title', {required:true})}
                        type={'text'}
                        placeholder={'Название категории'}
                    />
                </label>
                <Button type={'submit'} variant={'solid'}>Создать</Button>
            </form>
            </DialogContent>
        </Dialog>
    )
}

export default AddCategoryDialog;