import React from 'react';
import arrow from '../images/arrow.png';
import './langInput.css';
import devLog from '../utils/devLog';

const selectOptions = [
  {value: 'arabic', label: 'العربية Arabic'},
  {value: 'burmese', label: 'မြန်မာဘာသာ Burmese'},
  {value: 'chinese', label: '中文 Chinese'},
  {value: 'english', label: 'English'},
  {value: 'georgian', label: 'ქართული Georgian'},
  {value: 'hangul', label: '한국어 Korean'},
  {value: 'hebrew', label: 'עברית Hebrew'},
  {value: 'hindi', label: 'हिन्दी Hindi'},
  {value: 'japanese', label: '日本語 Japanese'},
  {value: 'thai', label: 'ไทย Thai'}
]

export default function LanguageInput ({language, changeHandler}) {

  const cycleLang = (direction) => {
    const currentLang = selectOptions.find(element => element.value === language);
    const index = selectOptions.indexOf(currentLang);
    console.log(`current index: ${index}`);
    let newIndex = (index + direction + selectOptions.length) % selectOptions.length;
    console.log(`new index: ${newIndex}`);
    devLog(`old lang: ${selectOptions[index].value} index: ${index}, new lang: ${selectOptions[newIndex].value} index: ${newIndex}`)
    const updatedLang = selectOptions[newIndex];
    changeHandler(updatedLang.value)
  }

  const setDisplayLang = () =>{
    const match = selectOptions.find(element => element.value === language);
    if (match) {
      devLog(`setting display lang to: ${match.value}`)
      return match.label
    } else {
      throw new Error("setDisplayLang: No match found in language options")
    }
  }

    return (
      <div className='language-input grid-box'>
        <img 
          id="left-arrow" 
          class="arrow-button" 
          src={arrow} 
          alt="left arrow"
          onClick={()=> cycleLang(-1)}></img>
        <div id="language">{setDisplayLang()}</div>
        <img 
          id="right-arrow" 
          class="arrow-button" 
          src={arrow} 
          style={{transform: "scaleX(-1)"}} 
          alt="right arrow"
          onClick={() => cycleLang(1)}></img>
      </div>
    )
}