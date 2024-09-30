import React, {useState} from 'react';
import {
    Button,
    Checkbox,
    Collapse,
    Divider, IconButton,
    List, ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    ListSubheader,
    Toolbar, Typography
} from "@mui/material";
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import SettingsIcon from '@mui/icons-material/Settings';
import AdsClickIcon from '@mui/icons-material/AdsClick';
import {InvestmentRecord} from "../Model & Util/ModelAPI.ts";
import {DatePicker, LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {Dayjs} from "dayjs";
import SettingsPage from "./SettingsPage.tsx";

interface DrawerContentsProps {
    recList: InvestmentRecord[]; // List of investment record data
    ownerChecked: Set<string>; // set that stores the currently checked owner names
    handleOwnerToggle(owner: string, isOnly?: boolean): void; // toggle the check state for the owner names
    marketChecked: Set<string>; // set that stores the currently checked marketplace names
    handleMarketToggle(market: string, isOnly?: boolean): void; // toggle the check state for marketplace names
    bankChecked: Set<string>; // set that stores the currently checked bank names
    handleBankToggle(bank: string, isOnly?: boolean): void; // toggle the check state for bank names
    // the filter start date for maturity date (in raw records tab), and for income date (in calculation tab)
    filterStartDate: null | Dayjs; //
    // the filter end date for maturity date (in raw records tab), and for income date (in calculation tab)
    filterEndDate: null | Dayjs; //
    setFilterStartDate(value: null | Dayjs): void; // callback to update the filter start date
    setFilterEndDate(value: null | Dayjs): void; // callback to update the filter end date
    resetFilters(): void; // callback to reset all filters (back to all checked initial state)
}

const DrawerContents: React.FC<DrawerContentsProps> = ({
                                                           ownerChecked, handleOwnerToggle, recList,
                                                           marketChecked, handleMarketToggle,
                                                           bankChecked, handleBankToggle,
                                                           filterStartDate, filterEndDate,
                                                           setFilterStartDate, setFilterEndDate,
                                                           resetFilters
                                                       }) => {
    const [isOwnerOpen, setIsOwnerOpen] = useState<boolean>(true);
    const [isMarketOpen, setIsMarketOpen] = useState<boolean>(false);
    const [isBankOpen, setIsBankOpen] = useState<boolean>(false);

    const [settingsOpen, setSettingsOpen] = useState(false);

    const ownerOptions = Array.from(new Set(recList?.map((rec) => rec.owner)));
    const marketplaceOptions = Array.from(new Set(recList?.map((rec) => rec.marketplace)));
    const bankOptions = Array.from(new Set(recList?.map((rec) => rec.bank)));

    return (
        <div>
            <Toolbar sx={{bgcolor: 'secondary.main'}}>
                <Typography variant="subtitle1" noWrap component="div" sx={{color: '#fff'}}>
                    Menu Options
                </Typography>
            </Toolbar>
            <Divider/>
            <List subheader={
                <ListSubheader>Filters
                    <Button color="warning" sx={{marginLeft: "1em"}}
                            onClick={() => {
                                setIsMarketOpen(false);
                                setIsBankOpen(false);
                                resetFilters();
                            }}>
                        Reset All
                    </Button>
                </ListSubheader>}>
                {/*Owner filters*/}
                <ListItemButton onClick={() => setIsOwnerOpen(!isOwnerOpen)}>
                    <ListItemIcon>
                        <AccountCircleIcon/>
                    </ListItemIcon>
                    <ListItemText primary="Owner"/>
                    {isOwnerOpen ? <ExpandLessIcon/> : <ExpandMoreIcon/>}
                </ListItemButton>
                <Collapse in={isOwnerOpen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding dense>
                        {
                            ownerOptions.map((owner) =>
                                <ListItem key={owner}
                                          secondaryAction={
                                              <IconButton edge="end"
                                                          onClick={() => handleOwnerToggle(owner, true)}>
                                                  <AdsClickIcon/>
                                              </IconButton>
                                          }>
                                    <ListItemButton key={owner} sx={{pl: 4}}>
                                        <ListItemIcon>
                                            <Checkbox edge="start" disableRipple
                                                      checked={ownerChecked.has(owner)}
                                                      onClick={() => handleOwnerToggle(owner)}/>
                                        </ListItemIcon>
                                        <ListItemText primary={owner}/>
                                    </ListItemButton>
                                </ListItem>)
                        }
                    </List>
                </Collapse>
                {/*Marketplace name filters*/}
                <ListItemButton onClick={() => setIsMarketOpen(!isMarketOpen)}>
                    <ListItemIcon>
                        <RequestQuoteIcon/>
                    </ListItemIcon>
                    <ListItemText primary="Marketplace"/>
                    {isMarketOpen ? <ExpandLessIcon/> : <ExpandMoreIcon/>}
                </ListItemButton>
                <Collapse in={isMarketOpen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding dense>
                        {
                            marketplaceOptions.map(marketplace =>
                                <ListItem key={marketplace}
                                          sx={{pl: 2}}
                                          secondaryAction={
                                              <IconButton edge="end"
                                                          onClick={() => handleMarketToggle(marketplace, true)}>
                                                  <AdsClickIcon/>
                                              </IconButton>
                                          }>
                                    <ListItemButton>
                                        <ListItemIcon>
                                            <Checkbox edge="start" disableRipple
                                                      checked={marketChecked.has(marketplace)}
                                                      onClick={() => handleMarketToggle(marketplace)}/>
                                        </ListItemIcon>
                                        <ListItemText primary={marketplace}/>
                                    </ListItemButton>
                                </ListItem>)
                        }
                    </List>
                </Collapse>
                {/*Bank name filters*/}
                <ListItemButton onClick={() => setIsBankOpen(!isBankOpen)}>
                    <ListItemIcon>
                        <AccountBalanceIcon/>
                    </ListItemIcon>
                    <ListItemText primary="Bank"/>
                    {isBankOpen ? <ExpandLessIcon/> : <ExpandMoreIcon/>}
                </ListItemButton>
                <Collapse in={isBankOpen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding dense>
                        {
                            bankOptions.map(bank =>
                                <ListItem key={bank}
                                          sx={{pl: 2}}
                                          secondaryAction={
                                              <IconButton edge="end"
                                                          onClick={() => handleBankToggle(bank, true)}>
                                                  <AdsClickIcon/>
                                              </IconButton>
                                          }>
                                    <ListItemButton>
                                        <ListItemIcon>
                                            <Checkbox edge="start" disableRipple
                                                      checked={bankChecked.has(bank)}
                                                      onClick={() => handleBankToggle(bank)}/>
                                        </ListItemIcon>
                                        <ListItemText primary={bank}/>
                                    </ListItemButton>
                                </ListItem>)
                        }
                    </List>
                </Collapse>
                <Divider/>
                <ListItem>
                    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={navigator.language.toLowerCase()}>
                        <DatePicker label="Filter start date" value={filterStartDate}
                                    slotProps={{
                                        field: {clearable: true},
                                        actionBar: {
                                            actions: ['today'],
                                        },
                                    }}
                                    onChange={(newVal) => setFilterStartDate(newVal)}/>
                    </LocalizationProvider>
                </ListItem>
                <ListItem>
                    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={navigator.language.toLowerCase()}>
                        <DatePicker label="Filter end date" value={filterEndDate}
                                    slotProps={{field: {clearable: true}}}
                                    onChange={(newVal) => setFilterEndDate(newVal)}/>
                    </LocalizationProvider>
                </ListItem>
                <Divider/>
                <ListSubheader>Other Pages</ListSubheader>
                <ListItemButton onClick={() => setSettingsOpen(true)}>
                    <ListItemIcon>
                        <SettingsIcon/>
                    </ListItemIcon>
                    <ListItemText primary="Settings & Info"/>
                </ListItemButton>
            </List>
            <SettingsPage open={settingsOpen} handleClose={() => setSettingsOpen(false)}/>
        </div>
    );
};

export default DrawerContents;