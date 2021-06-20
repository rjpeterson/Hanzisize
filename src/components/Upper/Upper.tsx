import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import AppBar from '@material-ui/core/AppBar';
import Grid from '@material-ui/core/Grid';
import HelpOutline from '@material-ui/icons/HelpOutline';
import IconButton from '@material-ui/core/IconButton';
import Box from '@material-ui/core/Box';

import LangSelectBar from './LangSelect/LangSelect';
import logo from '../../images/logo.png';


const useStyles = makeStyles({
  logo: {
    width: '2rem',
    height: '2rem',
    paddingLeft: '.25rem'
  },
  toolbar: {
    minHeight: '64px'
  },
  help: {
    position: 'absolute',
    top: 0,
    right: 0
  },
})

type UpperProps = {
  language: string;
  changeHandler: Function
}

export default function Upper({language, changeHandler}: UpperProps) {
  const classes = useStyles();

  return (
    <div className="upper-container">
      <AppBar position="static">
        <Toolbar 
          className={classes.toolbar}
          color="primary"
          disableGutters
        >
          <Grid 
            container 
            spacing={1} 
            justify="center" 
            alignItems="center"
          >
            <Grid item>
              <img src={logo} alt="logo" className={classes.logo}/>
            </Grid>
            <Grid item>
              <LangSelectBar 
                language={language}
                changeHandler={changeHandler}
              />
            </Grid>
            <Grid item>
              <Box 
                className={classes.help}
              >
                <IconButton 
                  size="small" 
                  href='https://rjpeterson.github.io/hanzisize-about/' target="_blank"
                  color="secondary"
                >
                  <HelpOutline />
                </IconButton>
              </Box>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
    </div>
  )
}