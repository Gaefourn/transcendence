import React, {CSSProperties, useEffect} from "react";
import {useLocation} from 'react-router-dom';
import {useAuthTfaMutation, useGetConnectedQuery, useLoginMutation} from 'store/api';
import { Navigate } from "react-router-dom";
import imgCookie from "img/cookie-cat.gif";
import {Dialog, DialogContent, DialogTitle} from "@mui/material";
import InputTfa from 'components/InputTfa';

const styles: Record<string, CSSProperties>= {
  title: {
    display: "flex",
    height: "100%",
    color: "white",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "25px",
    flexDirection: "column",
  },
  img: {
    marginBottom: 8,
    width: 200,
    height: 200,
    objectFit: "cover",
    borderRadius: 100,
  },
  modal: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
}

function useQuery(): URLSearchParams {
  return new URLSearchParams(useLocation().search);
}

const Loading = () => {
  return <>
    <img src={imgCookie} style={styles.img} alt={'cookie'}/>
    Loading...
  </>
}

const Auth: React.FC = () => {
  const { data: connected } = useGetConnectedQuery();
  const code = useQuery().get("code");
  const [login, { isLoading, isError, data, error } ] = useLoginMutation();
  const [ trigger, { isLoading: tfaLoading, isError: tfaError } ] = useAuthTfaMutation();

  useEffect(() => {
    if (code)
      login(code);
  }, [login, code]);

  const handle = (res: string) => {
    if (res.length === 6)
      trigger(res);
  }

  if (error)
    return <Navigate replace={true} to='/' />;

  if (connected)
    return <Navigate replace={true} to="/" />;
  if (isLoading || !data)
    return <div style={styles.title}>
      <Loading />
    </div>;

  if (isError)
    return <div style={styles.title}>Login Failed</div>;
  return <div style={styles.title}>
    {tfaLoading && <Loading />}
    {data!.tfa && <Dialog open={true}>
        <DialogTitle>Two-Factor Authentication is enabled</DialogTitle>
        <DialogContent style={styles.modal}>
            <div>Please enter the TFA code to continue</div>
            <InputTfa length={6} validate={handle} error={tfaError}/>
        </DialogContent>
    </Dialog>}
  </div>;
}

export default Auth;
