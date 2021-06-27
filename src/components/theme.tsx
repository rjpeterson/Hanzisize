import { createMuiTheme } from '@material-ui/core/styles';
import { grey } from '@material-ui/core/colors';
import { common } from "@material-ui/core/colors";

const theme = createMuiTheme({
  typography: {
    body1: {
      'font-size': 14,
      'line-height': 1,
      'text-align': 'center'
    },
    body2: {
      'font-size': 10,
      'text-align': 'center',
      'color': grey[700],
      'line-height': 1
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