import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import AppBar from '@material-ui/core/AppBar';
import Grid from '@material-ui/core/Grid';

import LangSelectBar from './LangSelect/LangSelect';
import logo from '../../images/logo.png';


const useStyles = makeStyles({
  logo: {
    width: '2rem',
    height: '2rem',
  },
  toolbar: {
    minHeight: '64px'
  }
})

export default function Upper({language, changeHandler}) {
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
          </Grid>
        </Toolbar>
      </AppBar>
    </div>
  )
}