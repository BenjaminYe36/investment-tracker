import React, {useState} from "react";
import {
    Autocomplete,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle, InputAdornment,
    MenuItem,
    TextField
} from "@mui/material";
import ModelAPI, {CouponFreqStr, InvestmentRecord} from "../Model & Util/ModelAPI.ts";
import {DatePicker, LocalizationProvider} from "@mui/x-date-pickers";
import dayjs, {Dayjs} from "dayjs";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import "dayjs/locale/zh-cn";
import Util from "../Model & Util/Util.ts";

interface AddDialogProps {
    recList: InvestmentRecord[]; // List of investment record data
    model: ModelAPI; // Reference to the fake backend Api
    refreshModel(): void; // callback to refresh from backend after modifying
    open: boolean; // whether the dialog is open
    handleClose(): void; // callback to close the dialog
}

const AddDialog: React.FC<AddDialogProps> = ({
                                                 recList, model, refreshModel,
                                                 open, handleClose
                                             }) => {
    const [owner, setOwner] = useState('');
    const [marketplace, setMarketplace] = useState('');
    const [bank, setBank] = useState('');
    const [quantity, setQuantity] = useState('');
    const [couponRate, setCouponRate] = useState('');
    const [startDate, setStartDate] = useState<null | Dayjs>(null);
    const [maturityDate, setMaturityDate] = useState<null | Dayjs>(null);
    const [firstCouponDate, setFirstCouponDate] = useState<null | Dayjs>(null);
    const [couponFreq, setCouponFreq] = useState('');

    const resetForm = () => {
        setOwner('');
        setMarketplace('');
        setBank('');
        setQuantity('');
        setCouponRate('');
        setStartDate(null);
        setMaturityDate(null);
        setFirstCouponDate(null);
        setCouponFreq('');
    };

    const ownerOptions = Array.from(new Set(recList?.map((rec) => rec.owner)));
    const marketplaceOptions = Array.from(new Set(recList?.map((rec) => rec.marketplace)));
    const bankOptions = Array.from(new Set(recList?.map((rec) => rec.bank)));

    return (
        <Dialog open={open}
                onClose={handleClose}
                scroll="paper"
                maxWidth="md"
                fullWidth
                PaperProps={{
                    component: 'form',
                    onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
                        event.preventDefault();
                        const formData = new FormData(event.currentTarget);
                        const formJson = Object.fromEntries((formData as any).entries());
                        console.log(formJson);
                        // remember to parse numbers from string for quantity & coupon rate
                        // also need to parse date string to iso format
                        model.addRecord(formJson.owner, formJson.marketplace, formJson.bank,
                            parseFloat(formJson.quantity), parseFloat(formJson.couponRate) / 100.0,
                            dayjs(formJson.startDate, Util.getDateFormatString(navigator.language)).toISOString(),
                            dayjs(formJson.maturityDate, Util.getDateFormatString(navigator.language)).toISOString(),
                            dayjs(formJson.firstCouponDate, Util.getDateFormatString(navigator.language)).toISOString(),
                            formJson.couponFreq);
                        resetForm();
                        refreshModel();
                        handleClose();
                    },
                }}>
            <DialogTitle>Add a new investment record</DialogTitle>
            <DialogContent>
                <Box sx={{marginTop: "1em"}}>
                    <Autocomplete value={owner} freeSolo
                                  options={ownerOptions}
                                  renderInput={
                                      (params) => (
                                          <TextField {...params} label="Owner" name="owner" required/>
                                      )
                                  }/>
                    <Autocomplete value={marketplace} freeSolo
                                  options={marketplaceOptions}
                                  sx={{marginTop: "1em"}}
                                  renderInput={
                                      (params) => (
                                          <TextField {...params} label="Marketplace Name" name="marketplace" required/>
                                      )
                                  }/>
                    <Autocomplete value={bank} freeSolo
                                  options={bankOptions}
                                  sx={{marginTop: "1em"}}
                                  renderInput={
                                      (params) => (
                                          <TextField {...params} label="Bank Name" name="bank" required/>
                                      )
                                  }/>
                    <TextField value={quantity} label="Quantity" name="quantity"
                               sx={{marginTop: "1em", width: "45%"}}
                               required
                               onChange={(e) => setQuantity(e.target.value)}
                               InputProps={{
                                   startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                   type: 'number',
                               }}/>
                    <TextField value={couponRate} label="Coupon Rate (APY)" name="couponRate"
                               sx={{marginTop: "1em", float: "right", width: "45%"}}
                               required
                               onChange={(e) => setCouponRate(e.target.value)}
                               InputProps={{
                                   endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                   type: 'number',
                               }}/>
                    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={navigator.language.toLowerCase()}>
                        <DatePicker
                            label="Start Date"
                            value={startDate as null | undefined}
                            views={['year', 'month', 'day']}
                            slotProps={{textField: {name: 'startDate', required: true}, field: {clearable: true}}}
                            onChange={(newValue) => setStartDate(newValue)}
                            sx={{marginTop: "1em", width: "100%"}}
                        />
                        <DatePicker
                            label="Maturity Date"
                            value={maturityDate as null | undefined}
                            slotProps={{textField: {name: 'maturityDate', required: true}, field: {clearable: true}}}
                            onChange={(newValue) => setMaturityDate(newValue)}
                            sx={{marginTop: "1em", width: "100%"}}
                        />
                        <DatePicker
                            label="First Coupon Date"
                            value={firstCouponDate as null | undefined}
                            slotProps={{textField: {name: 'firstCouponDate', required: true}}}
                            onChange={(newValue) => setFirstCouponDate(newValue)}
                            sx={{marginTop: "1em", width: "100%"}}
                        />
                    </LocalizationProvider>
                    <TextField value={couponFreq} label="Coupon Frequency" name="couponFreq" select required fullWidth
                               onChange={(e) => setCouponFreq(e.target.value)}
                               sx={{marginTop: "1em"}}>
                        {
                            Object.values(CouponFreqStr).map((freq) => {
                                return (
                                    <MenuItem key={freq} value={freq}>
                                        {freq}
                                    </MenuItem>);
                            })
                        }
                    </TextField>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => {
                    resetForm();
                    handleClose();
                }}>Cancel</Button>
                <Button type="submit">OK</Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddDialog;