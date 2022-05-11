import React from 'react';
import ReactDOM from 'react-dom';

import 'style/index.css';
import App from './App';
import { Provider } from "react-redux";
import { store } from "store";
import {createTheme, ThemeProvider} from '@mui/material';

const darkTheme = createTheme({
  palette: {
    primary: {
      main: "#1976D2",
    },
    mode: 'dark',
  },
});

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={darkTheme}>
      <Provider store={store}>
        <App />
      </Provider>
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
