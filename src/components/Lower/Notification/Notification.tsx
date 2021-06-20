import React from 'react';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  notification: {
    fontSize: '.7rem',
    height: 'auto',
    width: '80%',
    marginLeft: 'auto',
    marginRight: 'auto',
    textAlign: 'center',
  }
})

type NotificationProps = {
  iFrames: boolean
}

export default function Notification({iFrames}: NotificationProps) {
  const classes = useStyles();

  const notificationSwap = () => {
    if(iFrames) {
      return (
        <Typography color='error'>
          Warning: This page contains iframes. Hanzisize may not work properly.
        </Typography>
      )
    } else {
      return (
        <Typography variant='body2'>
          Resize Hotkey: Alt+Shift+Q
        </Typography>
      )
    }
  }

  return (
    <Box className={classes.notification}>
      {notificationSwap()}
    </Box>
  )
}