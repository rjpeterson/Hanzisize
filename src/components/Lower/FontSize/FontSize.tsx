import React, { ChangeEvent, ChangeEventHandler } from 'react';
import Button from '@material-ui/core/Button';
import Input from '@material-ui/core/Input';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import { makeStyles, withStyles, createStyles } from '@material-ui/core/styles';
import { grey } from '@material-ui/core/colors';
import Grid from '@material-ui/core/Grid';
import { Typography } from '@material-ui/core';

import "./FontSize.css";

const fontSizes = {
  small: 10,
  medium: 18,
  large: 24
}

const useStyles = makeStyles({
  grid: {
    paddingTop: '1rem',
    paddingBottom: '.5rem',
  },
  subgrid: {
    padding: '0 5px',
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
  plusMinusButton: {
    height: '1rem',
    border: '1px solid',
    borderRadius: 4,
    backgroundColor: grey[50],
    borderColor: grey[800],
    color: grey[800],
  }
})

const FontSizeInput = withStyles({
  root: {
    width: 57,
    height: '1rem',
    boxShadow: 'none',
    textTransform: 'none',
    padding: '8px 0px',
    textAlign: 'center',
    lineHeight: 1.5,
    color: grey[800],
    'font-family': [
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
    ],
  },
  underline: {
    '&::before': {
      'left': '20%',
      'width': '60%'
    },
    '&::after': {
      'left': '20%',
      'width': '60%'
    },
  }
})(Input);

const NormalButton = withStyles({
  root: {
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
      boxShadow: "2px 2px 6px 1px rgba(0, 0, 0, 0.1)",
    }
  },
})(Button);

const ActiveButton = withStyles({
  root: {
    height: 57,
    boxShadow: "2px 2px 6px 1px rgba(0, 0, 0, 0.1)",
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
      boxShadow: "2px 2px 6px 1px rgba(0, 0, 0, 0.1)",
    },
  },
})(Button);

type FontSizeButtonsProps = {
  minFontSize: number;
  changeHandler: Function
}

export default function FontSizeButtons({minFontSize, changeHandler}: FontSizeButtonsProps) {
  const classes = useStyles();

  const handleButtonClick = (newValue: Number) => {
    changeHandler(newValue);
  };

  const decrementFontSize = () => {
    const newMinFontSize = (minFontSize > 0) ? (minFontSize - 1) : 0;
    changeHandler(newMinFontSize);
  }

  const incrementFontSize = () => {
    const newMinFontSize = (minFontSize < 99) ? (minFontSize + 1) : 99;
    changeHandler(newMinFontSize);
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    changeHandler(event.target.value === '' ? '' : Number(event.target.value));
  };

  const handleBlur = () => {
    if (minFontSize < 0) {
      changeHandler(0);
    } else if (minFontSize > 99) {
      changeHandler(99);
    }
  };

  const buttonSwap = (minFontSize: number, fontsizeSML: number) => {
    if(minFontSize === fontsizeSML) {
      return (
        <ActiveButton onClick={() => { handleButtonClick(fontsizeSML)}}>
          <Typography style={{fontSize: fontsizeSML}}>
            Aa
          </Typography>
        </ActiveButton>
      )
    } else {
      return (
        <NormalButton onClick={() => {handleButtonClick(fontsizeSML)}}>
          <Typography style={{fontSize: fontsizeSML}}>
            Aa
          </Typography>
        </NormalButton>
      )
    }
  }

  return (
    <Grid 
      container 
      className={classes.grid} 
      spacing={1} 
      alignItems="center" 
      justify="center"
    >
      <Grid item>{buttonSwap(minFontSize, fontSizes.small)}</Grid>
      <Grid item>{buttonSwap(minFontSize, fontSizes.medium)}</Grid>
      <Grid item>{buttonSwap(minFontSize, fontSizes.large)}</Grid>
      <Grid item>
        <Grid 
          container
          className={classes.subgrid}
          direction="column"
          justify="space-evenly"
          alignItems="center"
        >
          <Grid item>
            <Typography variant='body2'>
              Custom
            </Typography>
          </Grid>
          <Grid item xs>
          {/* @ts-ignore */}
            <FontSizeInput
              type="number"
              value={minFontSize}
              onChange={(event) => {handleInputChange(event)}}
              onBlur={handleBlur}
              disableUnderline
              inputProps={{
                style: {textAlign: 'center'},
                step: 1,
                min: 0,
                max: 99,
                type: 'number',
                'aria-label': 'minimum font size',
                }
              }
            />
          </Grid>
          <Grid item>
            <ButtonGroup
              orientation="horizontal"
              color="default"
              aria-label="horizontal outlined primary button group"
            >
              <Button 
                size="small"
                className={classes.plusMinusButton}
                onClick={() => {decrementFontSize()}}
              >
                -
              </Button>
              <Button 
                size="small"
                className={classes.plusMinusButton}  
                onClick={() => {incrementFontSize()}}
                >
                  +
                </Button>
            </ButtonGroup>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}