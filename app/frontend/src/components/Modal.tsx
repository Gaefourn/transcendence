import React, {CSSProperties, useEffect, useState} from 'react';
import {Button, ButtonProps, Dialog, DialogActions, DialogContent, DialogTitle} from '@mui/material';
import usePrevious from 'hooks/usePrevious';

const styles: Record<string, CSSProperties> = {
  modal: {
    display: "flex",
    width: "400px",
    flexDirection: "column",
  },
  modalButton: {
    alignSelf: "center",
    width: "120px",
    borderRadius: "8px",
    fontWeight: "bold",
  },
}

type Props = {
  children?: React.ReactNode,
  action: string,
  validate: () => Promise<boolean>,
  cancel?: boolean,
  title?: string,
  titleComponent?: React.ReactNode,
  actionProps?: Partial<ButtonProps>,
  buttonProps?: Partial<ButtonProps>,
  buttonStyle?: CSSProperties,
  disabled?: boolean,
  onClose?: () => void,
}

export const Modal: React.FC<Props> = ({ action, validate, children,
  buttonStyle, buttonProps, cancel=true, title, titleComponent, actionProps={},
  disabled= false, onClose = () => {} }) => {
  const [open, setOpen] = useState(false);
  const prev = usePrevious(open);

  const { style: actionStyle = {}, ...actionOthers } = actionProps;

  const doValidate = async () => {
    if (await validate())
      setOpen(false);
  }

  useEffect(() => {
    if (!open && prev) {
      onClose();
    }
  }, [open, prev, onClose]);

  return <>
    <Button style={buttonStyle} variant="outlined" disabled={disabled} onClick={() => setOpen(true)} {...actionOthers} {...buttonProps}>{buttonProps?.children ?? action}</Button>
    <Dialog open={open} onClose={() => setOpen(false)}>
      {(title || titleComponent) && <DialogTitle>
        {titleComponent || (title ? title : "")}
        </DialogTitle>}
      <DialogContent style={styles.modal}>
        {children}
      </DialogContent>
      <DialogActions style={{ display: 'flex', justifyContent: cancel ? 'space-between': 'center', padding: '0px 24px 16px'}}>
          <Button style={{ ...actionStyle, ...styles.modalButton}} variant="contained" onClick={doValidate} {...actionOthers}>{action}</Button>
          {cancel && <Button style={styles.modalButton} variant="outlined" onClick={() => setOpen(false)}>Cancel</Button>}
      </DialogActions>
    </Dialog>
  </>
}
