import React, { useEffect, useRef, useState } from 'react';

import useOutsideAlerter from "../../hooks/useOutsideClickAlerter";

import styles from "./autocomplete.module.css";

import searchIcon from "../../assets/images/icons/search.png";
import { OptionProps } from '../OptionProps.types';

type AutocompleteProps = {
    options: OptionProps[],
    handleOptionSelection: (option: OptionProps) => void,
    selectedOptionsList: Set<string>,
    placeholder: string,
    noResultMsg: string
}


const AutoComplete = ({ options, handleOptionSelection, selectedOptionsList, placeholder, noResultMsg }: AutocompleteProps) => {
    const [filteredOptions, setFilteredOptions] = useState<OptionProps[]>([]);
    const [showNoResultMsg, setShowNoResultMsg] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [highlightedIndex, setHighlightedIndex] = useState<number|undefined>();


    useEffect(()=>{
        if(inputRef.current)
            inputRef.current.focus();   
    }, [])

    const clearSearchResult = () => {
        if(inputRef.current) {
            inputRef.current.value = '';
        }
        setShowNoResultMsg(false);
        setFilteredOptions([]);
    }

    const handleKeyEvents = (e: KeyboardEvent) => {
        if(e.target != inputRef.current) return;
        
        switch(e.code) {
            case "Escape":
                clearSearchResult();
                break;
            default: 
                break;
        }
    }

    useOutsideAlerter(containerRef, clearSearchResult);

    useEffect(() => {
        inputRef.current?.addEventListener('keydown', handleKeyEvents);

        return ()=> {
            inputRef.current?.removeEventListener('keydown', handleKeyEvents);
        }
    }, [])

    const handleOnSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const searchValue = event.target.value;
        let filteredList = [];

        if (searchValue.length >= 1) {
            filteredList = options.filter(item => item.label.substring(0, searchValue.length).toLowerCase() === searchValue.toLowerCase());
            setFilteredOptions(filteredList);

            if (!filteredList.length) {
                setShowNoResultMsg(true);
            }
        } else {
            clearSearchResult();
        }
    }

    const addWhiteCheckIconForSelectedItem = (index:number) => {
        setHighlightedIndex(index);
    }

    const addBlackCheckIconForSelectedItem = () => {
        setHighlightedIndex(undefined);
    }

    return (
        <div ref={containerRef} className={styles.wrapper}>
            <div className={styles["search-input-wrapper"]}>
                <img className={styles["search-icon"]} src={searchIcon} alt="search icon" />
                <input
                    className={styles["search-input"]}
                    type="text"
                    placeholder={placeholder}
                    onChange={handleOnSearchChange}
                    ref={inputRef}
                />
            </div>
            {
                filteredOptions?.length ?
                    <div className={styles["search-result-wrapper"]} >
                        {
                            filteredOptions.map((item, index) => (
                                <div
                                    className={styles["search-result"]}
                                    onClick={() => handleOptionSelection(item)}
                                    onMouseLeave={()=>addBlackCheckIconForSelectedItem()}  
                                    onMouseEnter={()=>addWhiteCheckIconForSelectedItem(index)}
                                    key={index}
                                >
                                    <div className={styles["search-result-label"]}>
                                        <img className={styles["item-icon"]} src={item.icon} alt={`${item.label} logo`} />
                                        <label>{item.label}</label>
                                    </div>
                                    {
                                        selectedOptionsList.has(item.value) ?
                                        <div className={`${styles["checkmark"]}
                                            ${highlightedIndex === index ? styles["checkmark-white"] : ""}
                                        `}></div> 
                                        : null
                                    }
                                </div>
                            ))
                        }
                    </div>
                    : null
            }
            {
                showNoResultMsg && !filteredOptions.length ?
                    <div className={styles["search-result-wrapper"]} >
                        <div className={styles["no-item-msg"]}>{noResultMsg}</div>
                    </div>
                    : null
            }

        </div>
    )
}

export default AutoComplete;