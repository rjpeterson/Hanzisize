import React from 'react';
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  warning: {
    fontSize: '.7rem',
    height: 'auto',
    width: '80%',
    marginLeft: 'auto',
    marginRight: 'auto',
    textAlign: 'center',
  },
  hidden: {
    display: 'none',
  }
})

export default function IFrameWarning({display}) {
const classes = useStyles();

  return (
    <Box className={display ? classes.warning : classes.hidden}>
      <Typography>
        Warning: This page contains iframes. Hanzisize may not work properly.
      </Typography>
    </Box>
  )
}