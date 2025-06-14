import React, {useState} from 'react';
import {Dialog, DialogContent} from "@mui/material";
import {Button, Input} from "@/components/ui";
import {categoryItem} from "@/@types/categoruItem";
import {response} from "@/@types/response";
import {outlayCategories} from "@/@types/outlayCategories";
import {useForm} from "react-hook-form";
import rtkQueryService from "@/services/RtkQueryService";

interface editCategoryItem {
	editModalOpen: boolean;
	setEditModalOpen: (open: boolean) => void;
	currentItem: categoryItem;
}

const EditCategoryItem = ({
    editModalOpen,
    setEditModalOpen,
    currentItem,
}: editCategoryItem)  => {
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

	const {register, handleSubmit, reset} = useForm<outlayCategories>()

	const [updateOutlayCategories] = rtkQueryService.useUpdateOutlayCategoryItemMutation();
	const {refetch} = rtkQueryService.useGetOutlayCategoryItemsQuery({token})


	const submit = (data:object) => {
		updateOutlayCategories({data: {...data, id:currentItem.id}, token})
		.then((res:response) => {
			if(res.data) {
				refetch()
				setEditModalOpen(false)
				reset()
			}
		})
	}

    return (
        <Dialog
            open={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            fullWidth
            maxWidth="sm"
        >
            <DialogContent>
                <h3>Изменение причины</h3>
                <form
                    className={'flex flex-col gap-4 mt-4'}
                    onSubmit={handleSubmit(submit)}
                >
                    <label>
                        <span>Название причины</span>
                        <Input
                            defaultValue={currentItem.title}
                            type={'text'}
                            {...register('title', { required: true })}
                        />
                    </label>
                    <Button variant={'solid'}>Сохраниить</Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default EditCategoryItem;