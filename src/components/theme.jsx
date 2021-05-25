import { createMuiTheme } from '@material-ui/core/styles';
import { grey } from '@material-ui/core/colors';
import { common } from "@material-ui/core/colors";

const theme = createMuiTheme({
  typography: {
    body1: {
      fontSize: 14,
      lineHeight: 1,
      textAlign: 'center'
    },
    body2: {
      fontsize: '.3rem',
      textAlign: 'center',
      fontWeight: 200,
      lineHeight: .75
    }
  },
  palette: {
    primary: {
      main: '#74BED3',
      contrastText: common.white,
    },
    secondary: {
      main: grey[100],
    },
    contrastThreshold: 1,
    tonalOffset: .4,
  }
})

export default theme;