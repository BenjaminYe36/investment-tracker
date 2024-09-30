import React, {useContext, useEffect, useState} from "react";
import {appDataDir} from "@tauri-apps/api/path";
import {writeText} from "@tauri-apps/api/clipboard";
import {shell} from "@tauri-apps/api";
import {
    Alert,
    AppBar,
    Box,
    Dialog,
    Divider, FormControlLabel,
    IconButton,
    InputAdornment,
    Snackbar, styled, Switch,
    TextField,
    Toolbar, Tooltip,
    Typography, useTheme
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import {ColorModeContext} from "../App.tsx";


interface SettingsPageProps {
    open: boolean; // whether the dialog is open
    handleClose(): void; // callback to close the dialog
}

const SettingsPage: React.FC<SettingsPageProps> = ({open, handleClose}) => {
    // data path that stores taskData and other data (if added in future updates)
    const [dataPath, setDataPath] = useState('');

    const [snackbarOpen, setSnackbarOpen] = useState(false);

    // context for managing display theme
    const colorMode = useContext(ColorModeContext);

    const handleSnackClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    const handleCopyPath = () => {
        writeText(dataPath)
            .then(() => {
                setSnackbarOpen(true);
            })
            .catch((e) => {
                console.error(e);
            });
    };

    // Handles open folder in default explorer app
    const handleOpenFolder = async () => {
        shell.open(dataPath)
            .catch((e) => {
                console.error(e);
            });
    };


    useEffect(() => {
        appDataDir()
            .then((dir) => {
                setDataPath(dir + "Database");
            })
            .catch((e) => {
                console.log(e);
            });
    }, []);

    return (
        <Dialog open={open} onClose={handleClose} fullScreen>
            <AppBar sx={{ml: 3, bgcolor: 'primary.main'}}>
                <Toolbar>
                    <IconButton edge="start" onClick={handleClose}>
                        <CloseIcon/>
                    </IconButton>
                    <Typography variant="h6" noWrap component="div" sx={{ml: 2, flex: 1}}>
                        Settings & Info
                    </Typography>
                </Toolbar>
            </AppBar>
            <Box sx={{mt: 12, ml: 5, mr: 5}}>
                <FormControlLabel
                    control={<DarkModeSwitch sx={{m: 1}}
                                             checked={useTheme().palette.mode === 'dark'}
                                             onClick={colorMode.toggleColorMode}
                    />}
                    label="Dark/Light Theme Switch"
                />
                <Divider sx={{mt: 2, mb: 2}}/>
                <TextField value={dataPath} label="Data storage location"
                           sx={{width: `${dataPath.length + 8}ch`}}
                           InputProps={{
                               endAdornment:
                                   <InputAdornment position="end">
                                       <Tooltip title="Copy Path">
                                           <IconButton onClick={handleCopyPath}>
                                               <ContentCopyIcon/>
                                           </IconButton>
                                       </Tooltip>
                                       <Tooltip title="Open Folder">
                                           <IconButton onClick={handleOpenFolder}>
                                               <FolderOpenIcon/>
                                           </IconButton>
                                       </Tooltip>
                                   </InputAdornment>
                           }}/>
            </Box>

            <Snackbar open={snackbarOpen} autoHideDuration={2000}
                      onClose={handleSnackClose}
                      anchorOrigin={{
                          vertical: 'top',
                          horizontal: 'center'
                      }}>
                <Alert severity="success" variant="filled"
                       sx={{width: '100%'}} onClose={handleSnackClose}>
                    Copy to clipboard success!
                </Alert>
            </Snackbar>
        </Dialog>
    );
};

const DarkModeSwitch = styled(Switch)(({theme}) => ({
    width: 62,
    height: 34,
    padding: 7,
    '& .MuiSwitch-switchBase': {
        margin: 1,
        padding: 0,
        transform: 'translateX(6px)',
        '&.Mui-checked': {
            color: '#fff',
            transform: 'translateX(22px)',
            '& .MuiSwitch-thumb:before': {
                backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
                    '#fff',
                )}" d="M4.2 2.5l-.7 1.8-1.8.7 1.8.7.7 1.8.6-1.8L6.7 5l-1.9-.7-.6-1.8zm15 8.3a6.7 6.7 0 11-6.6-6.6 5.8 5.8 0 006.6 6.6z"/></svg>')`,
            },
            '& + .MuiSwitch-track': {
                opacity: 1,
                backgroundColor: '#aab4be',
                ...theme.applyStyles('dark', {
                    backgroundColor: '#8796A5',
                }),
            },
        },
    },
    '& .MuiSwitch-thumb': {
        backgroundColor: '#001e3c',
        width: 32,
        height: 32,
        '&::before': {
            content: "''",
            position: 'absolute',
            width: '100%',
            height: '100%',
            left: 0,
            top: 0,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
                '#fff',
            )}" d="M9.305 1.667V3.75h1.389V1.667h-1.39zm-4.707 1.95l-.982.982L5.09 6.072l.982-.982-1.473-1.473zm10.802 0L13.927 5.09l.982.982 1.473-1.473-.982-.982zM10 5.139a4.872 4.872 0 00-4.862 4.86A4.872 4.872 0 0010 14.862 4.872 4.872 0 0014.86 10 4.872 4.872 0 0010 5.139zm0 1.389A3.462 3.462 0 0113.471 10a3.462 3.462 0 01-3.473 3.472A3.462 3.462 0 016.527 10 3.462 3.462 0 0110 6.528zM1.665 9.305v1.39h2.083v-1.39H1.666zm14.583 0v1.39h2.084v-1.39h-2.084zM5.09 13.928L3.616 15.4l.982.982 1.473-1.473-.982-.982zm9.82 0l-.982.982 1.473 1.473.982-.982-1.473-1.473zM9.305 16.25v2.083h1.389V16.25h-1.39z"/></svg>')`,
        },
        ...theme.applyStyles('dark', {
            backgroundColor: '#003892',
        }),
    },
    '& .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: '#aab4be',
        borderRadius: 20 / 2,
        ...theme.applyStyles('dark', {
            backgroundColor: '#8796A5',
        }),
    },
}));

export default SettingsPage;