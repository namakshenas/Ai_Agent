import SelectPresetClass from "./SelectPresetClass";

/* eslint-disable @typescript-eslint/no-unused-vars */
export const basePreset = new SelectPresetClass(
    { // width font
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