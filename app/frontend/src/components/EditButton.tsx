import {Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, TextField} from '@mui/material';
import React, {CSSProperties, useState} from 'react';
import EditIcon from '@mui/icons-material/Edit';
import {useChangeAvatarMutation, useChangeUsernameMutation} from 'store/api';

const styles: Record<string, CSSProperties> = {
    edit: {
        color: "white",
        backgroundColor: "grey"
    },
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
    id: string;
}

const EditButton: React.FC<Props> = ({ id }) => {
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const [username, setUsername] = useState("");
    const [file, setFile] = useState("");
    const [isFilePicked, setIsFilePicked] = useState(false);
    const [newUsername] = useChangeUsernameMutation();
    const [newAvatar] = useChangeAvatarMutation();

    const changeHandler = (event: any) => {
        const type = event.target.files[0].type;

        if (type === 'image/jpeg'
            || type === 'image/png'
            || type === 'image/jpg'
            || type === 'image/gif') {
            setFile(event.target.files[0]);
            setIsFilePicked(true);
        }
    }

    const submit = async () => {
        if (username)
            await newUsername({ username, id })
        if (isFilePicked)
            await newAvatar({ file, id })
        setUsername("");
        setOpen(false);
    }

    return (
        <div>
            <IconButton onClick={handleOpen} style={styles.edit}>
                <EditIcon />
            </IconButton>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Edit profile</DialogTitle>
                <DialogContent style={styles.modal}>
                    <p color={"#C4C4C4"}>Username</p>
                    <TextField
                      autoFocus
                      onChange={event => {setUsername(event.target.value)}}
                    />
                    <p color={"#C4C4C4"}>Avatar</p>
                    <input type="file" accept="image/*" onChange={changeHandler}/>
                </DialogContent>
                <DialogActions style={{display: 'flex', justifyContent: 'space-between', padding: '0px 24px 16px', marginTop: '16px'}}>
                    <Button style={styles.modalButton} variant="outlined" onClick={handleClose}>Cancel</Button>
                    <Button style={styles.modalButton} variant="contained" onClick={submit}>Submit</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default EditButton;
