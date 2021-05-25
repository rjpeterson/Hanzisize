import React from 'react';
import Button from '@material-ui/core/Button';
import Input from '@material-ui/core/Input';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { grey } from '@material-ui/core/colors';
import Grid from '@material-ui/core/Grid';
import { Typography } from '@material-ui/core';

const fontSizes = {
  small: 10,
  medium: 16,
  large: 24
}

const useStyles = makeStyles({
  grid: {
    paddingTop: '1rem',
    paddingBottom: '.25rem',
  },
  small: {
    fontSize: fontSizes.small
  },
  medium: {
    fontSize: fontSizes.medium
  },
  large: {
    fontSize: fontSizes.large
  },
  input: {
    width: 67,
    boxShadow: 'none',
    textTransform: 'none',
    padding: '8px 7px',
    lineHeight: 1.5,
    color: grey[800],
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"'
    ]
  },
  activeButton: {
    boxShadow: "0 3px 6px 2px rgba(255, 105, 135, .3)",
    color: grey[50],
    backgroundColor: grey[500]
  }
})

const NormalButton = withStyles({
  root: {
    width: 67,
    height: 57,
    boxShadow: 'none',
    textTransform: 'none',
    padding: '8px 7px',
    border: '1px solid',
    borderRadius: 13,
    lineHeight: 1.5,
    backgroundColor: grey[50],
    borderColor: grey[800],
    color: grey[800],
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    '&:hover': {
      backgroundColor: grey[300],
      color: grey[800],
      boxShadow: 'none',
    },
    '&:active': {
      boxShadow: 'none',
      color: grey[50],
      backgroundColor: grey[500]
    },
    '&:focus': {
      boxShadow: "0 3px 6px 2px rgba(255, 105, 135, .3)",
      color: grey[50],
      backgroundColor: grey[500]
    },
  },
})(Button);

const ActiveButton = withStyles({
  root: {
    width: 67,
    height: 57,
    boxShadow: "0 3px 6px 2px rgba(255, 105, 135, .3)",
    textTransform: 'none',
    padding: '8px 7px',
    border: '1px solid',
    borderRadius: 13,
    lineHeight: 1.5,
    backgroundColor: grey[500],
    borderColor: grey[800],
    color: grey[50],
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    '&:hover': {
      backgroundColor: grey[300],
      color: grey[800],
      boxShadow: 'none',
    },
  },
})(Button);

export default function FontSizeButtons({minFontSize, changeHandler}) {
  const classes = useStyles();

  const handleButtonClick = (newValue) => {
    changeHandler(newValue);
  };

  const handleInputChange = (event) => {
    changeHandler(event.target.value === '' ? '' : Number(event.target.value));
  };

  const handleBlur = () => {
    if (minFontSize < 0) {
      changeHandler(0);
    } else if (minFontSize > 99) {
      changeHandler(99);
    }
  };

  const buttonSwap = (minFontSize, fontsizeSML) => {

    if(minFontSize === fontsizeSML) {
      return <ActiveButton
        onClick={() => { handleButtonClick(fontsizeSML)}}
      >
      <Typography
        style={{fontSize: fontsizeSML}}
      >
        Aa
      </Typography>
    </ActiveButton>
    } else {
      return <NormalButton
        onClick={() => {handleButtonClick(fontsizeSML)}}
      >
      <Typography
        style={{fontSize: fontsizeSML}}
      >
        Aa
      </Typography>
    </NormalButton>
    }
  }

  return (
    <Grid 
      container 
      className={classes.grid} 
      spacing={2} 
      alignItems="center" 
      justify="center"
    >
      <Grid item>
        {/* <NormalButton
          onClick={() => {handleButtonClick(fontSizes.s)}}
          className={minFontSize === fontSizes.s ? classes.is_active : ''}
        >
          <Typography
            className={classes.small}
          >
            Aa
          </Typography>
        </NormalButton> */}
        {buttonSwap(minFontSize, fontSizes.small)}
      </Grid>
      <Grid item>
        {/* <NormalButton
          onClick={() => { handleButtonClick(fontSizes.m)}}
          className={minFontSize === fontSizes.m ? classes.is_active : ''}
        >
          <Typography
            className={classes.medium}
          >
            Aa
          </Typography>
        </NormalButton> */}
        {buttonSwap(minFontSize, fontSizes.medium)}
      </Grid>
      <Grid item>
        {/* <ActiveButton
          onClick={() => { handleButtonClick(fontSizes.l)}}
        >
          <Typography
            className={classes.large}
          >
            Aa
          </Typography>
        </ActiveButton> */}
        {buttonSwap(minFontSize, fontSizes.large)}
      </Grid>
      <Grid item>
        <Typography variant='body2'>
          Custom
        </Typography>
        <Input
          className={classes.input}
          value={minFontSize}
          onChange={(event) => {handleInputChange(event)}}
          onBlur={handleBlur}
          inputProps={{
            step: 1,
            min: 0,
            max: 99,
            type: 'number',
            'aria-label': 'minimum font size',
            }
          }
        />
      </Grid>
    </Grid>
  );
}