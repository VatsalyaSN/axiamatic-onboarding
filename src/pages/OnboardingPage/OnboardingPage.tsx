import React, { useRef, useState, useEffect } from "react";

import AutoComplete from "../../components/Autocomplete/Autocomplete";
import SelectionBox from "../../components/SelectionBox/SelectionBox";

import styles from './onboardingPage.module.css';

import CONSTANTS from './onboardingPageConstants.json';
import { OptionProps } from '../../components/OptionProps.types';
import softwareList from "../../data/softwareList.json";

const OnboardingPage = () => {
    const [showError, setShowError] = useState(false);
    const selectedProductsTracker = useRef<Set<string>>(new Set());
    const [selectedProducts, setSelectedProducts]=useState<(OptionProps)[]>([]);
    const [showSuccessMsg, setShowSuccessMsg] = useState(false);
    const initialData = {label: '', value: '', icon: '', empty: true};

    const getInitialData = (selectedProductsTracker: React.MutableRefObject<Set<string>>) => {
        const savedProducts = localStorage.getItem('selectedSoftwares');
        let initialProducts = new Array(4).fill(initialData);
    
        if(savedProducts && JSON.parse(savedProducts)) {
            initialProducts = JSON.parse(savedProducts);
            
            for(const product of initialProducts) {
                if(product) {
                    selectedProductsTracker.current.add(product.value);
                }
            }
        }
        
        return initialProducts;
    }

    useEffect(()=>{
        const initialSelectedProductState = getInitialData(selectedProductsTracker);
        setSelectedProducts(initialSelectedProductState);
    }, [])

    const handleAddProductAction = (productSelected: OptionProps) => {
        if(selectedProducts.filter(item=> !item.empty ).length === 4) {
            setShowError(true);
            return;
        } 

        if(!selectedProductsTracker.current.has(productSelected.value)) {
            const indexOfEmptySlot = selectedProducts.findIndex(item=> item.empty);
            const updatedList = [...selectedProducts.slice(0, indexOfEmptySlot), productSelected, ...selectedProducts.slice(indexOfEmptySlot+1)];
                
            setSelectedProducts(updatedList);
            selectedProductsTracker.current.add(productSelected.value);
        }
    }

    const handleRemoveProductAction = (productToBeRemoved: OptionProps) => {
        const index = selectedProducts.findIndex((item)=> item?.value === productToBeRemoved.value);
        const updateSelectedProducts = [...selectedProducts.slice(0, index), initialData,...selectedProducts.slice(index+1)];
        
        selectedProductsTracker.current.delete(productToBeRemoved.value)

        setSelectedProducts(updateSelectedProducts);
        setShowError(false);

        if((selectedProductsTracker.current.size === 0)) {
            localStorage.removeItem('selectedSoftwares');
        }
    }

    const handleNextAction = () => {
        setShowSuccessMsg(true);
        setShowError(false);
        setTimeout(()=> {
            setShowSuccessMsg(false);
        }, 1500);

        localStorage.setItem('selectedSoftwares', JSON.stringify(selectedProducts));
    }

    return (
        <div className={styles['page-wrapper']}>
            <header className={styles['header']}>
                <h2>{CONSTANTS.TITLE}</h2>
                <button className={styles['exit-button']}>{CONSTANTS.EXIT_BTN_TEXT}</button>
            </header>
            <div className={styles['section-wrapper']}>
                <section className={styles['product-selection-wrapper']}>
                    <section className={styles['product-selection']}>
                        { 
                        selectedProducts.map((product, index)=> (
                            <SelectionBox
                                handleRemoveAction={handleRemoveProductAction} 
                                selectedItem={product} 
                                key={index}
                            />
                        ))
                        }
                    </section>
                    <p>{selectedProducts.filter(item => !item.empty)?.length} {CONSTANTS.PRODUCT_COUNT_TEXT}</p>
                </section>
                <section className={styles['instructions-wrapper']}>
                    <div className={styles['instructions']}>
                        <div className={styles['step-indicator']}>
                            1 of 3
                        </div>
                        <div className={styles['instruction-text-wrapper']}>
                            <h2>{CONSTANTS.INSTRUCTION_1_TITLE}</h2>
                            <p 
                                className={styles['instruction-text']}
                            >
                                {CONSTANTS.INSTRUCTION_1_DESC}
                            </p>
                        </div>
                        <p 
                            className={styles['error-msg']}
                            style={{visibility: `${showError ? 'visible': 'hidden'}`}}
                        >
                            {CONSTANTS.MAX_ALLOWED_PRODUCTS_ERROR_MSG}
                        </p>
                    </div>
                    <div className={styles['product-search-wrapper']}>
                        <AutoComplete 
                            options={softwareList}
                            handleOptionSelection={handleAddProductAction}
                            selectedOptionsList={selectedProductsTracker.current}
                            placeholder={CONSTANTS.SEARCH_INPUT_PLACEHOLDER}
                            noResultMsg={CONSTANTS.NO_RESULT_MSG}
                        />
                        <button 
                            disabled={!selectedProductsTracker?.current.size} 
                            className={styles['next-button']} 
                            onClick={handleNextAction}
                        >
                            {CONSTANTS.NEXT_BTN_TEXT}
                        </button>
                        <p 
                            className={styles['success-msg']}
                            style={{visibility: `${showSuccessMsg ? 'visible': 'hidden'}`}} 
                        >
                            {CONSTANTS.SUCCESS_MSG}
                        </p>
                    </div>
                </section>
            </div>
        </div>
    )
}

export default OnboardingPage;