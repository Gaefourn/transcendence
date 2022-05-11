import React from 'react';
import {Divider} from '@mui/material';


const Separated: React.FC<{ children: React.ReactNode, last: boolean }> = ({ children, last }) => {
  return <>
    {children}
    {last ? "" : <Divider sx={{width: "80%", alignSelf: "center"}}/>}
  </>
}

export default Separated
