import React from 'react';
import arrow from '../images/arrow.png';
import './newLangInput.css';
import isDevMode from '../utils/isDevMode';

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

class LanguageInput extends React.Component {
  constructor(props) {
    super(props);
    this.cycleLang = this.cycleLang.bind(this);
    this.setDisplayLang = this.setDisplayLang.bind(this);
  }

  cycleLang = direction => {
    const currentLang = selectOptions.find(element => element.value === this.props.language);
    const index = selectOptions.indexOf(currentLang);
    console.log(`current index: ${index}`);
    let newIndex = (index + direction + selectOptions.length) % selectOptions.length;
    console.log(`new index: ${newIndex}`);
    if (isDevMode()) console.log(`old lang: ${selectOptions[index].value} index: ${index}, new lang: ${selectOptions[newIndex].value} index: ${newIndex}`)
    const updatedLang = selectOptions[newIndex];
    this.props.changeHandler(updatedLang.value)
  }

  setDisplayLang = () =>{
    const match = selectOptions.find(element => element.value === this.props.language);
    if (match) {
      if (isDevMode()) console.log(`setting display lang to match: ${match.value}`)
      return match.label
    } else {
      throw new Error("setDisplayLang: No match found in language options")
    }
  }

  render() {
    if (isDevMode()) console.log(`rendering lang-input default = ${JSON.stringify(this.setDisplayLang())}`)
    return (
      <div className='language-input grid-box'>
        <img 
          id="left-arrow" 
          class="arrow-button" 
          src={arrow} 
          alt="left arrow"
          onClick={()=> this.cycleLang(-1)}></img>
        <div id="language">{this.setDisplayLang()}</div>
        <img 
          id="right-arrow" 
          class="arrow-button" 
          src={arrow} 
          style={{transform: "scaleX(-1)"}} 
          alt="right arrow"
          onClick={() => this.cycleLang(1)}></img>
      </div>
    )
  }
}

export default LanguageInput;