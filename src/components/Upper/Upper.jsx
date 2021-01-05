import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import AppBar from '@material-ui/core/AppBar';
import Grid from '@material-ui/core/Grid';

import LangSelectBar from './LangSelect/LangSelect';
import logo from '../../images/logo.png';


const useStyles = makeStyles({
  root: {
    marginTop: 0,
    paddingTop: 6,
    paddingBottom: 6,
    paddingLeft: 12,
    paddingRight: 12,
  },
  logo: {
    display: 'flex',
    maxWidth: '12%',
  },
})

export default function Upper({language, changeHandler}) {
  const classes = useStyles();

  return (
    <div className="upper-container">
      <AppBar position="static">
        <Toolbar 
          className={classes.root} 
          color="primary"
        >
          <Grid 
            container 
            spacing={.5} 
            justify="center" 
            alignItems="center"
          >
            <Grid item className={classes.logo}>
              <img src={logo} alt="logo" />
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