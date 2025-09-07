import React, {useState} from "react";
import Icon from "/src/assets/Icon.png";

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
            <h1>List of options</h1>
            <hr className="divider" />
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

