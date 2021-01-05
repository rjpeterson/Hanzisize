import React from 'react';
import IFrameWarning from '../IFrameWarning';

import InputSlider from './InputSlider/InputSlider';

import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import HelpOutline from '@material-ui/icons/HelpOutline';
import IconButton from '@material-ui/core/IconButton';
import 'fontsource-roboto';

const useStyles = makeStyles({
  lower: {
    position: 'relative',
  },
  help: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
})

export default function Lower({minFontSize, changeHandler, iFrames}) {
  const classes = useStyles();

  return (
    <div className="lower-container">
      <Box className={classes.lower}>
      <InputSlider 
        minFontSize={minFontSize}
        changeHandler={changeHandler}
      />
      <Box 
        className={classes.help}
      >
        <IconButton size="small" href='https://github.com/rjpeterson/Hanzisize#donate' target="_blank">
          <HelpOutline />
        </IconButton>
      </Box>
      <IFrameWarning 
        display={iFrames}
      />
      </Box>
    </div>
  )
}