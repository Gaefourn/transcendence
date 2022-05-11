import React, {CSSProperties} from "react";
import { Button } from "@mui/material";

import imgPong from "img/pong.png";

const styles : Record<string, CSSProperties>= {
  header: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
  },
  img: {
    maxWidth: '100%',
    maxHeight: 'auto',
  },
  button: {
    margin: '16px',
    marginTop: '4em',
  },
};

const Login: React.FC = () => {
  function intra() {
    const client_id = process.env.REACT_APP_CLIENT_ID!;
    const redirect = encodeURIComponent(process.env.REACT_APP_CALLBACK_URL!);
    window.location.href = "https://api.intra.42.fr/oauth/authorize?" +
      `client_id=${client_id}` +
      `&redirect_uri=${redirect}&response_type=code`;
  }

  return (
    <div style={styles.header}>
        <img style={styles.img} src={imgPong} alt="logo" />
      <Button style={styles.button} variant="contained" onClick={intra}>
        Login with intra
      </Button>
    </div>
  );
};

export default Login;
