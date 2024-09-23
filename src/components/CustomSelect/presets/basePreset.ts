import SelectPresetClass from "./SelectPresetClass";

/* eslint-disable @typescript-eslint/no-unused-vars */
export const basePreset = new SelectPresetClass(
    { // weight font
        width : '200px',
        height: '44px',
        font : 'Jost',
        labelTextColor: "#454545",
        selectBackgroundColor: "#dfe4ea88",
        selectTextColor: "#454545",
        hoverOptionTextColor: "#FFFFFF",
        optionsContainerBackgroundColor: "#f6f6f9",
        optionsContainerBorderColor: "#4d749434",
        arrowColor: "#213547",
        selectBorderColor: { default: "#4d749434", focus: "#86e5ce" },
        borderRadius : '4px',
        optionBackgroundColor: { active: "#4d749428", hover: "#56b8af" }
    }
)


const newPreset = {
    select : {
        width : '100px',
        height: '30px',
        font : 'Jost',
    },
    combobox : {
        width : '100%',
        height : '100%',
        border : 'none',
        boxShadow : 'none',
        background : 'none',
        outline :'none',
        color : 'black',
    },
    comboboxFocus :{
        border: 'none',
        outline : 'none',
    },
    optionsContainer : {
        background : 'none',
        border  : 'none',
    },
    option : {
        background : 'blue',
        color : 'black',
    },
    optionHover : {
        background : 'blue',
        color : 'white',
    },
    optionActive : {
        background : 'blue',
        color: 'white',
    }
}