import React, { useContext } from 'react';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Slider from '@material-ui/core/Slider';
import Input from '@material-ui/core/Input';
import InputAdornment from '@material-ui/core/InputAdornment';
import Typography from '@material-ui/core/Typography';
import './minFontSize.css'
import devLog from '../utils/devLog'
import Context from '../utils/context';

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

export default function InputSlider({minFontSize, changeHandler}) {

  const handleSliderChange = (event, newValue) => {
    changeHandler(newValue)
  };

  const handleInputChange = (event) => {
    changeHandler(event.target.value === '' ? '' : Number(event.target.value));
  };

  const handleBlur = () => {
    if (minFontSize < 0) {
      changeHandler(0);
    } else if (minFontSize > 50) {
      changeHandler(50);
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