import React, {useState} from "react";
import { useLocation } from "react-router-dom";
import { Header } from "../Components/Header";
import AddProductRecall from "../Components/AddProductRecall";


export function ProductRecallPage(){

    return (
        <>
            <Header />
            <AddProductRecall/>
            
        </>
    );
}