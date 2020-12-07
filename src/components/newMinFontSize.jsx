import React from 'react';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Slider from '@material-ui/core/Slider';
import Input from '@material-ui/core/Input';
import InputAdornment from '@material-ui/core/InputAdornment';
import Typography from '@material-ui/core/Typography';
import './newMinFontSize.css'
import isDevMode from '../logic/isDevMode';

const MySlider = withStyles({
  root: {
    color: "#565857",
  }
})(Slider);

const MyInput = withStyles({
  input: {
    width: 42,
    textAlign: "right",
  },
})(Input)

export default function InputSlider(minFontSizeProp, changeHandlerProp) {
  const [minFontSize, setMinFontSize] = React.useState(minFontSizeProp);

  const handleSliderChange = (event, newValue) => {
    setMinFontSize(newValue);
    changeHandlerProp(minFontSize)
  };

  const handleInputChange = (event) => {
    setMinFontSize(event.target.value === '' ? '' : Number(event.target.value));
    changeHandlerProp(minFontSize);
  };

  const handleBlur = () => {
    if (minFontSize < 0) {
      setMinFontSize(0);
    } else if (minFontSize > 50) {
      setMinFontSize(50);
    }
  };

  return (
    <div className='mfs-input'>
      <Grid container spacing={2} alignItems="center">
      <Grid item>
          <MyInput
            disableUnderline="true"
            fullWidth="true"
            endAdornment={
              <InputAdornment position="end">
                <Typography variant="body1">pt</Typography>
              </InputAdornment>
            }
            value={minFontSize}
            margin="none"
            onChange={handleInputChange}
            onBlur={handleBlur}
            inputProps={{
              step: 1,
              min: 0,
              max: 50,
              type: 'number',
              'aria-labelledby': 'input-slider',
            }}
          />
        </Grid>
        <Grid item xs>
          <MySlider
            value={typeof minFontSize === 'number' ? minFontSize : 0}
            onChange={handleSliderChange}
            aria-labelledby="input-slider"
            max={50}
          />
        </Grid>
      </Grid>
    </div>
  );
}