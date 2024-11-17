import React, {useState} from 'react';
import DrawerContents from "./DrawerContents";
import {AppBar, Box, Drawer, Fab, IconButton, Tab, Toolbar, Tooltip, Typography} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AddIcon from '@mui/icons-material/Add';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ReceiptIcon from '@mui/icons-material/Receipt';
import TabPanel from '@mui/lab/TabPanel';
import AddDialog from "./AddDialog.tsx";
import ModelAPI, {CouponFreqStr, GetMoneyRecord, GetMoneyTypeStr, InvestmentRecord} from "../Model & Util/ModelAPI.ts";
import RawDataTable from "./RawDataTable.tsx";
import dayjs, {Dayjs} from "dayjs";
import {TabContext, TabList} from "@mui/lab";
import GetMoneyDateTable from "./GetMoneyDateTable.tsx";
import Util from "../Model & Util/Util.ts";

interface MainContentProps {
    recList: InvestmentRecord[]; // List of investment record data
    model: ModelAPI; // Reference to the fake backend Api
    refreshModel(): void; // callback to refresh from backend after modifying
    ownerChecked: Set<string>; // set that stores the currently checked owner names
    handleOwnerToggle(owner: string): void; // toggle the check state for the owner names
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

const drawerWidth = 240; // width of the left sidebar drawer

const MainContent: React.FC<MainContentProps> = ({
                                                     recList, model, refreshModel,
                                                     ownerChecked, handleOwnerToggle,
                                                     marketChecked, handleMarketToggle,
                                                     bankChecked, handleBankToggle,
                                                     filterStartDate, filterEndDate,
                                                     setFilterStartDate, setFilterEndDate,
                                                     resetFilters
                                                 }) => {
    // whether the mobile (on small screen width) drawer with clicking icon to open is open
    const [mobileOpen, setMobileOpen] = useState(false);
    // whether the mobile (on small screen width) drawer is closing right now
    const [isClosing, setIsClosing] = useState(false);

    // whether the add new record dialog is open
    const [addDialogOpen, setAddDialogOpen] = useState(false);

    // which tab index is the tab in the main page on
    const [tabVal, setTabVal] = useState("0");

    const handleDrawerClose = () => {
        setIsClosing(true);
        setMobileOpen(false);
    };

    const handleDrawerTransitionEnd = () => {
        setIsClosing(false);
    };

    const handleDrawerToggle = () => {
        if (!isClosing) {
            setMobileOpen(!mobileOpen);
        }
    };

    // filter by checked items is "AND" between each condition (intersection of sets)
    let filteredList = recList.filter((rec) =>
        ownerChecked.has(rec.owner) && marketChecked.has(rec.marketplace) && bankChecked.has(rec.bank));
    // filter by date is inclusive on both ends (start and end date)
    if (filterStartDate !== null) {
        filteredList = filteredList.filter((rec) =>
            filterStartDate.isSame(dayjs(rec.maturityDate), 'date') ||
            filterStartDate.isBefore(dayjs(rec.maturityDate), 'date'));
    }
    if (filterEndDate !== null) {
        filteredList = filteredList.filter((rec) =>
            filterEndDate.isSame(dayjs(rec.maturityDate), 'date') ||
            filterEndDate.isAfter(dayjs(rec.maturityDate), 'date'));
    }

    // Populate the data from recList & filter to create the date for get money dates
    let getMoneyList: GetMoneyRecord[] = [];
    recList.forEach((rec) => {
        if (rec.couponFreq === CouponFreqStr.maturity) {
            const interestYears = dayjs(rec.maturityDate).diff(dayjs(rec.startDate), 'year', true);
            const interestDays = dayjs(rec.maturityDate).diff(dayjs(rec.startDate), 'day');
            const interest = Util.getAnnuallyCompoundInterest(rec.quantity, rec.couponRate, interestYears, interestDays);
            getMoneyList.push({
                getMoneyDate: rec.maturityDate,
                getMoneyType: GetMoneyTypeStr.mature,
                originalMoney: rec.quantity,
                interest: interest,
                record: rec
            });
        } else if (rec.couponFreq === CouponFreqStr.semiannually || rec.couponFreq === CouponFreqStr.monthly) {
            const monthAdvance = rec.couponFreq === CouponFreqStr.semiannually ? 6 : 1;
            let currentStartDate = dayjs(rec.startDate);
            let currentCouponDate = dayjs(rec.firstCouponDate);
            while (currentCouponDate.isBefore(dayjs(rec.maturityDate), 'date')) {
                const interestYears = currentCouponDate.diff(currentStartDate, 'year', true);
                const interestDays = currentCouponDate.diff(currentStartDate, 'day');
                const interest = Util.getAnnuallyCompoundInterest(rec.quantity, rec.couponRate, interestYears, interestDays);
                getMoneyList.push({
                    getMoneyDate: currentCouponDate.toISOString(),
                    getMoneyType: GetMoneyTypeStr.interest,
                    originalMoney: 0,
                    interest: interest,
                    record: rec
                });
                currentStartDate = currentCouponDate;
                currentCouponDate = currentCouponDate.add(monthAdvance, 'month');
                // Sometimes the expected last coupon date is so close to maturity date,
                // will assume it will be paid out at maturity for now
                if (Math.abs(currentCouponDate.diff(dayjs(rec.maturityDate), 'day')) < 28) {
                    currentCouponDate = currentCouponDate.add(monthAdvance, 'month');
                }
            }
            const interestDays = dayjs(rec.maturityDate).diff(currentStartDate, 'day');
            const interest = rec.quantity * rec.couponRate * interestDays / 365;
            getMoneyList.push({
                getMoneyDate: rec.maturityDate,
                getMoneyType: GetMoneyTypeStr.mature,
                originalMoney: rec.quantity,
                interest: interest,
                record: rec
            });
        } else {
            console.error("Type of Coupon Freq is not in possible options");
        }
    });
    // filter get money list
    getMoneyList = getMoneyList.filter((moneyRec) => {
        const rec = moneyRec.record;
        return ownerChecked.has(rec.owner) && marketChecked.has(rec.marketplace) && bankChecked.has(rec.bank);
    });
    if (filterStartDate !== null) {
        getMoneyList = getMoneyList.filter((moneyRec) =>
            filterStartDate.isSame(dayjs(moneyRec.getMoneyDate), 'date') ||
            filterStartDate.isBefore(dayjs(moneyRec.getMoneyDate), 'date'));
    }
    if (filterEndDate !== null) {
        getMoneyList = getMoneyList.filter((moneyRec) =>
            filterEndDate.isSame(dayjs(moneyRec.getMoneyDate), 'date') ||
            filterEndDate.isAfter(dayjs(moneyRec.getMoneyDate), 'date'));
    }

    return (
        <Box sx={{display: 'flex'}}>
            <AppBar
                position="fixed"
                sx={{
                    bgcolor: 'primary.main',
                    width: {sm: `calc(100% - ${drawerWidth}px)`},
                    ml: {sm: `${drawerWidth}px`},
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{mr: 2, display: {sm: 'none'}}}
                    >
                        <MenuIcon/>
                    </IconButton>
                    <Typography variant="h6" noWrap component="div">
                        Investment Tracker
                    </Typography>
                </Toolbar>
            </AppBar>
            <Box
                component="nav"
                sx={{width: {sm: drawerWidth}, flexShrink: {sm: 0}}}
            >
                {/*Drawer shown on small screens (click menu icon to open/close) */}
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onTransitionEnd={handleDrawerTransitionEnd}
                    onClose={handleDrawerClose}
                    ModalProps={{
                        keepMounted: true, // Better open performance on mobile.
                    }}
                    sx={{
                        display: {xs: 'block', sm: 'none'},
                        '& .MuiDrawer-paper': {boxSizing: 'border-box', width: drawerWidth},
                    }}
                >
                    <DrawerContents recList={recList} ownerChecked={ownerChecked}
                                    handleOwnerToggle={handleOwnerToggle}
                                    marketChecked={marketChecked} handleMarketToggle={handleMarketToggle}
                                    bankChecked={bankChecked} handleBankToggle={handleBankToggle}
                                    filterStartDate={filterStartDate} filterEndDate={filterEndDate}
                                    setFilterStartDate={setFilterStartDate} setFilterEndDate={setFilterEndDate}
                                    resetFilters={resetFilters}/>
                </Drawer>
                {/*Drawer shown on large screen (permanent)*/}
                <Drawer
                    variant="permanent"
                    sx={{
                        display: {xs: 'none', sm: 'block'},
                        '& .MuiDrawer-paper': {boxSizing: 'border-box', width: drawerWidth},
                    }}
                    open
                >
                    <DrawerContents recList={recList} ownerChecked={ownerChecked}
                                    handleOwnerToggle={handleOwnerToggle}
                                    marketChecked={marketChecked} handleMarketToggle={handleMarketToggle}
                                    bankChecked={bankChecked} handleBankToggle={handleBankToggle}
                                    filterStartDate={filterStartDate} filterEndDate={filterEndDate}
                                    setFilterStartDate={setFilterStartDate} setFilterEndDate={setFilterEndDate}
                                    resetFilters={resetFilters}/>
                </Drawer>
            </Box>
            <Box
                component="main"
                sx={{flexGrow: 1, p: 3, width: {sm: `calc(100% - ${drawerWidth}px)`}}}
            >
                <TabContext value={tabVal}>
                    <Box sx={{marginTop: "3em", marginBottom: "1em"}}>
                        <TabList centered onChange={(_event, value) => setTabVal(value)}>
                            <Tab value="0" label="Raw Records" icon={<ReceiptIcon/>}/>
                            <Tab value="1" label="Get Money Dates" icon={<CalendarMonthIcon/>}/>
                        </TabList>
                    </Box>
                    {/*Raw Records Tab*/}
                    <TabPanel value="0">
                        <RawDataTable recList={filteredList} model={model} refreshModel={refreshModel}/>
                        <Tooltip title="Add Investment Record" arrow>
                            <Fab color="secondary"
                                 sx={{position: 'fixed', bottom: 16, right: 16}}
                                 onClick={() => setAddDialogOpen(true)}>
                                <AddIcon/>
                            </Fab>
                        </Tooltip>
                        <AddDialog open={addDialogOpen} handleClose={() => setAddDialogOpen(false)}
                                   recList={recList} model={model} refreshModel={refreshModel}/>
                    </TabPanel>
                    {/*Get Money Date Tab*/}
                    <TabPanel value="1">
                        <GetMoneyDateTable getMoneyList={getMoneyList}/>
                    </TabPanel>
                </TabContext>
            </Box>
        </Box>
    );
};

export default MainContent;