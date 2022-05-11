import {Dialog, DialogContent, DialogTitle, Switch} from '@mui/material';
import React, {CSSProperties, useState} from 'react';
import { useActivateTfaMutation, useLazyGetQRCodeQuery, useSwitchTfaMutation } from 'store/api';
import InputTfa from 'components/InputTfa';

const styles : Record<string, CSSProperties>= {
    tfaSwitch: {
        display: "flex",
        alignItems: "center",
        color: "white",
    },
    modal: {
        display: "flex",
        flexDirection: "column",
        width: 'fit-content',
        alignItems: 'stretch'
    },
}

const TfaSwitch: React.FC<{checked: boolean}> = ( { checked }) => {
    const [ open, setOpen ] = useState(false);
    const [ code, setCode ] = useState('');
    const [ value, setValue ] = useState(checked);
    const [ switchTfa ] = useSwitchTfaMutation();
    const [ activateTfa, { isError } ] = useActivateTfaMutation();
    const [ trigger ] = useLazyGetQRCodeQuery();

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.checked);
        if (e.target.checked) {
            try {
                const { data } = await trigger();
                setCode(data);
                setOpen(true);
            }
            catch {
                setValue(false);
            }
        }
        else {
            switchTfa()
        }
    }

    const doActivateTfa = async (code: string) => {
        try {
            const res = await activateTfa(code);
            if ('data' in res) {
                setValue(true);
                setOpen(false);
            }
        }
        catch {
            setValue(false);
        }
    }

    return (
            <div style={styles.tfaSwitch}>
                <Switch color="warning" onChange={handleChange} checked={value}/>
                <p>2FA</p>
                <Dialog open={open} onClose= {() => setOpen(false)} >
                    <DialogTitle>Two-Factor Authentication</DialogTitle>
                    <DialogContent style={styles.modal}>
                        <img src={code} style={{borderRadius: '8px'}} alt={"QRcode"}/>
                        <InputTfa length={6} validate={doActivateTfa} error={isError} />
                    </DialogContent>
                </Dialog>
            </div>
    );
}

export default TfaSwitch;
