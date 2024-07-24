import React, {useState} from "react"
import { AddTransactionModal } from "../modals/AddTransactionModals";

export const AddTransactionButton = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);
    return(
        <div className="App">
            <button onClick={openModal}>Add Transaction</button>
            <AddTransactionModal isOpen={isModalOpen} onClose={closeModal} />
        </div>
    )
}