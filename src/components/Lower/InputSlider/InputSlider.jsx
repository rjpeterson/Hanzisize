import React from 'react';
import Slider from '@material-ui/core/Slider';
import Input from '@material-ui/core/Input';
import { makeStyles } from '@material-ui/core/styles';
import { grey } from '@material-ui/core/colors';
import Grid from '@material-ui/core/Grid';

import './InputSlider.css';

const useStyles = makeStyles({
  grid: {
    paddingTop: 10,
    paddingBottom: 4,
  },
  slider: {
    marginLeft: 85,
    width: 175,
  },
  input: {
    width: 35,
    color: grey[600],
    fontWeight: 800,
  },
})

export default function InputSlider({minFontSize, changeHandler}) {
  const classes = useStyles();

  const handleSliderChange = (event, newValue) => {
    changeHandler(newValue);
  };

  return (
    <Grid 
      container 
      className={classes.grid} 
      spacing={2} 
      alignItems="center" 
      justify="center"
    >
      <Grid item>
        <Slider
          className={classes.slider}
          value={typeof minFontSize === 'number' ? minFontSize : 0}
          max={99}
          onChange={(event, newValue) => {handleSliderChange(event, newValue)}}
          inputProps={{
            'aria-label': 'minimum font size'
          }}
        />
      </Grid>
      <Grid item>
        <Input
          readOnly="true"
          disableUnderline
          className={classes.input}
          value={minFontSize}
          margin="dense"
          // onChange={(event) => {handleInputChange(event)}}
          // onBlur={handleBlur}
          inputProps={{
            step: 1,
            min: 0,
            max: 99,
            type: 'number',
            'aria-label': 'minimum font size',
          }}
        />
      </Grid>
    </Grid>
  );
}