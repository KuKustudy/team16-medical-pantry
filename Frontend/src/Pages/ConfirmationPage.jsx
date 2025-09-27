import React, {useState} from "react";
import { useLocation } from "react-router-dom";
import { Header } from "../Components/Header";
import MedicalInput from "../Components/MedicalInput";


export function ConfirmationPage(){
    // location is a hook that holds the URI of the current page
    // location.state will hold the scanned text when scan page send the scanned text
    const location = useLocation();
    const { scannedText } = location.state || {};
    console.log("received item name", scannedText);

    return (
        <>
            <Header />
            <MedicalInput initialItemName={scannedText} />
        </>
    );
}