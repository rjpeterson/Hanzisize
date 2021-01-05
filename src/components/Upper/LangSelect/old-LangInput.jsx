import React, { useState, useEffect } from 'react';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import IconButton from '@material-ui/core/IconButton';
import Grid from '@material-ui/core/Grid';
import { withStyles, StylesProvider } from '@material-ui/core/styles';
import NavigateBeforeicon from '@material-ui/icons/NavigateBefore';
import NavigateNexticon from '@material-ui/icons/NavigateNext';
import arrow from '../images/arrow.png';
import './LangInput.css';
import testingTools from '../../../utils/testingTools';

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

const MySelect = withStyles({
  root: {
    textAlign: "center",
    position: "relative",
    fontSize: ".8rem",
    color: "beige",
    fontWeight: "bold",
    '&$focused': {
      color: '#000',
    },
  },
  focused: {},
  select: {
    paddingRight: "0px",
  },
  menu: {
    paper: {
      maxHeight: "5.5rem",
    },
  },
  paper: {},
  icon: {
    display: "none",
  },
})(Select);

export default function LanguageInput ({language, changeHandler}) {
  const getLangIndex = (inputLang) => {
    let index = 0;
    const currentLang = selectOptions.find(element => element.value === inputLang);
    index = selectOptions.indexOf(currentLang);
    return index;
  }

  const [ currentIndex, setCurrentIndex ] = useState(0);

  useEffect(() => {     
    changeHandler(selectOptions[currentIndex].value)
  },[currentIndex])

  const previousLang = () => {
    const newIndex = (currentIndex - 1 + selectOptions.length) % selectOptions.length;
    setCurrentIndex(newIndex);
  }

  const nextLang = () => {
    const newIndex = (currentIndex + 1) % selectOptions.length;
    setCurrentIndex(newIndex);
  }

  const handleChange = (event) => {
    setCurrentIndex(getLangIndex(event.target.value))
  }

    return (
      <StylesProvider injectFirst>
        <div className='language-input'>
          <img 
            id="left-arrow" 
            className="arrow-button" 
            src={arrow} 
            alt="left arrow"
            onClick={()=> previousLang()}>
          </img>          
          <MySelect 
            disableUnderline={true}
            value={selectOptions[currentIndex].value}
            onChange={handleChange}
            >
            {selectOptions.map(option => {
              return <MyMenuItem value={option.value}>{option.label}</MyMenuItem>
            })}
          </MySelect>
          <img 
            id="right-arrow" 
            className="arrow-button" 
            src={arrow} 
            style={{transform: "scaleX(-1)"}} 
            alt="right arrow"
            onClick={() => nextLang()}>
          </img>
        </div>
      </StylesProvider>
    )
}