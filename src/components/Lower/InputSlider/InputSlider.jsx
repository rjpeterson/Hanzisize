import React, { useState, useEffect } from 'react';
import Slider from '@material-ui/core/Slider';
import Input from '@material-ui/core/Input';
import { makeStyles } from '@material-ui/core/styles';
import { grey } from '@material-ui/core/colors';
import Grid from '@material-ui/core/Grid';

import './InputSlider.css';

const useStyles = makeStyles({
  root: {
    marginTop: 0,
    paddingTop: 6,
    paddingBottom: 6,
  },
  slider: {
    marginLeft: 30,
    width: 180,
  },
  input: {
    width: 35,
    color: grey[600],
    fontWeight: 800,
  },
})

export default function InputSlider({minFontSize, changeHandler}) {
  const classes = useStyles();
  const [value, setValue] = useState(0);

  useEffect(()=> {
    changeHandler(value)
  }, [value, changeHandler])

  const handleSliderChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleInputChange = (event) => {
    setValue(event.target.value === '' ? '' : Number(event.target.value));
  };

  const handleBlur = () => {
    if (value < 0) {
      setValue(0);
    } else if (value > 99) {
      setValue(99);
    }
  };

  return (
    <Grid 
      container 
      className={classes.root} 
      spacing={2} 
      alignItems="center" 
      justify="center"
    >
      <Grid item>
        <Slider
          className={classes.slider}
          value={typeof minFontSize === 'number' ? minFontSize : 0}
          max={99}
          onChange={handleSliderChange}
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
          value={value}
          margin="dense"
          onChange={handleInputChange}
          onBlur={handleBlur}
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