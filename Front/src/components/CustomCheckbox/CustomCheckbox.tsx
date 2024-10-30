import './CustomCheckbox.css'
import checkMark from '../../assets/checked.png';

export function CustomCheckbox({checked} : {checked : boolean}){
    return(
        <div className={checked ? "checkbox checked" : "checkbox"}>
            {checked && <img src={checkMark} alt="checked"/>}
        </div>
    )
}