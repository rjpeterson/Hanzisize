import React from 'react';
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { makeStyles, ThemeProvider } from '@material-ui/core/styles';
import theme from './theme';
import 'fontsource-roboto';

const useStyles = makeStyles({
  container: {
    width: 340,
    backgroundColor: theme.palette.primary.main,
    overflow: 'hidden',
    flexDirection: 'row',
    paddingTop: 6,
    paddingBottom: 6,
    display: 'flex',
    justifyContent: 'center',
  },
  errorMessage: {
    backgroundColor: theme.palette.secondary.main,
    maxWidth: '80%',
    textAlign: 'center',
  },
})

export default function ErrorMessage({errorMessage}) {
  const classes = useStyles();

  return (
    <ThemeProvider theme={theme}>
      <Container
        className={classes.container}
        fixed
      >
        <Paper 
          elevation={3}
          className={classes.errorMessage}
        >
          <Typography>
            {errorMessage}
          </Typography>
        </Paper>
      </Container>
    </ThemeProvider>
  )
}