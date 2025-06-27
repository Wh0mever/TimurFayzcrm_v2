import React, {useState} from 'react';
import {Button, Input, Table} from "@/components/ui";
import THead from "@/components/ui/Table/THead";
import Tr from "@/components/ui/Table/Tr";
import Th from "@/components/ui/Table/Th";
import TBody from "@/components/ui/Table/TBody";
import {outlayCategories} from "@/@types/outlayCategories";
import {useForm} from "react-hook-form";
import rtkQueryService from "@/services/RtkQueryService";
import CategoryLine from "@/views/Kassa/Categories/components/CategoryLine";
import {response} from "@/@types/response";
import { Dialog, DialogContent, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import Td from "@/components/ui/Table/Td";
import {IoCloseCircleOutline} from "react-icons/io5";
import {IoMdEye} from "react-icons/io";
import {MdDelete, MdEdit} from "react-icons/md";
import {categoryItem} from "@/@types/categoruItem";
import EditCategoryItem from "@/views/Kassa/Categories/components/EditCategoryItem";

interface outlaycatPrps {
    categories: outlayCategories[]
}

function CategoriesTable({categories}:outlaycatPrps) {
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

    const [editModalOpen, setEditModalOpen] = useState<boolean>(false)
    const {refetch} = rtkQueryService.useGetOutlayCategoryItemsQuery({token})

	const [deleteOutlayCategory] = rtkQueryService.useDeleteOutlayCategoryItemMutation()

	const deleteReq = (id:number | undefined) => {
		if (confirm()){
			deleteOutlayCategory({id, token})
			.then(() => {
				refetch()
			})
		}
	}

	const [currentItem, setCurrentItem] = useState<categoryItem>({
		"id": 0,
		"title": 'string',
		"category": 0,
		category_obj: {
			id: 0,
			title:'string'
		}
	})



	console.log(currentItem)
    return (
        <>
            <Table>
                <THead>
                    <Tr>
                        <Th>
                            Название
                        </Th>
                        <Th>
                            Действие
                        </Th>
                    </Tr>
                </THead>
                <TBody>
                    {
                        categories?.map((category) =>
	                        <Tr key={category.id}>
		                        <Td className={'w-full'}>{category.title}</Td>
		                        <Td className={'flex gap-1'}>
			                        <MdEdit
				                        onClick={() => {
					                        setCurrentItem(category)
					                        setEditModalOpen(true)
				                        }}
				                        className={'cursor-pointer'}
				                        size={20}
				                        color={'gray'}
			                        />
			                        <MdDelete
				                        onClick={() => deleteReq(category.id)}
				                        className={'cursor-pointer'}
				                        size={20}
				                        color={'gray'}
			                        />
		                        </Td>
	                        </Tr>
                        )
                    }
                </TBody>
            </Table>
	        {editModalOpen && <EditCategoryItem currentItem={currentItem} editModalOpen={editModalOpen} setEditModalOpen={setEditModalOpen}/>}
        </>
    );
}

export default CategoriesTable;