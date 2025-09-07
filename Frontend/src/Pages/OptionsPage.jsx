import React, {useState} from "react";
import Icon from "/src/assets/Icon.png";
import { Header } from "../Components/Header";

export function ListOfOptions(){
    const [options, setOptions] = useState(["Medical item name some random text some random text", "Medical item name some random text some random text", "Medical item name some random text some random text", "Medical item name some random text some random text"]);
    const [newOption, setNewOption] = useState("");

    function handleInputChange(event){
        setNewOption(event.target.value);
    }

    function addOption(){
        setOptions(o => [...o, newOption]);
        setNewOption("");
    }

    function ExpandOption(index){
        

    }


    return (
        <div className="List-Of-Options">
            <Header />
            <h1>Results</h1>
            <hr className="divider" />
            {/*Delete if we have data for results page */}
            <div>
                <input 
                    type="text"
                    placeholder="Enter an option"
                    value={newOption}
                    onChange={handleInputChange}/>
                <button 
                    className="add-button"
                    onClick={addOption}>
                    Add
                </button>
            </div>
            {/* till here*/}
            
            <ol>
                {options.map((options, index) =>
                    <li key={index}>
                        <span 
                            className="text"
                            >
                            {options}
                            </span>
                        <button
                            className="expand-button"
                            onClick={() => ExpandOption(index)}>
                            <img
                                src = {Icon}
                                alt = "Expand"
                                className="expand-icon"
                                />
                        </button>
                        
                    </li>
                )} 
            </ol>
        </div>
    );
}

