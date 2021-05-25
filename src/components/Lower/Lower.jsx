import React from 'react';
import Notification from './Notification/Notification';

import FontSize from './FontSize/FontSize';

import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import 'fontsource-roboto';

const useStyles = makeStyles({
  lower: {
    position: 'relative',
    paddingBottom: 2,
  }
})

export default function Lower({minFontSize, changeHandler, iFrames}) {
  const classes = useStyles();

  return (
    <div className="lower-container">
      <Box className={classes.lower}>
      <FontSize 
        minFontSize={minFontSize}
        changeHandler={changeHandler}
      />
      <Notification 
        iFrames={iFrames}
      />
      </Box>
    </div>
  )
}