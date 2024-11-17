import React, {useState} from "react";
import ModelAPI, {GetMoneyRecord, GetMoneyTypeStr} from "../Model & Util/ModelAPI.ts";
import {Box, Collapse, List, ListItem, ListItemButton, ListItemText, Typography} from "@mui/material";
import {
    DataGrid,
    FooterPropsOverrides, GridActionsCellItem,
    GridColDef,
    GridRowClassNameParams,
    GridSlotsComponentsProps
} from "@mui/x-data-grid";
import dayjs, {Dayjs} from "dayjs";
import Util from "../Model & Util/Util.ts";
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import {ExpandLess, ExpandMore} from "@mui/icons-material";

interface GetMoneyTableProps {
    getMoneyList: GetMoneyRecord[]; // a list of all get money records after filtering
    model: ModelAPI; // Reference to the fake backend Api
    refreshModel(): void; // callback to refresh from backend after modifying
}

declare module '@mui/x-data-grid' {
    interface FooterPropsOverrides {
        total: number;
        original: number;
        interest: number;
    }
}

const CustomFooter: React.FC<NonNullable<GridSlotsComponentsProps['footer']>> =
    (props) => {
        if (props.total == null || props.original == null || props.interest == null) {
            return (<Box></Box>);
        }
        return (
            <Box sx={{p: 1, display: 'flex'}}>
                <Typography>
                    Total: ${`${props.total.toLocaleString('en-US', {maximumFractionDigits: 2})}`}
                </Typography>
                <Typography sx={{marginLeft: "2em"}}>
                    Original: ${`${props.original.toLocaleString('en-US', {maximumFractionDigits: 2})}`}
                </Typography>
                <Typography sx={{marginLeft: "2em"}}>
                    Interest/Div: ${`${props.interest.toLocaleString('en-US', {maximumFractionDigits: 2})}`}
                </Typography>
            </Box>
        );
    };

const GetMoneyDateTable: React.FC<GetMoneyTableProps> = ({getMoneyList, model, refreshModel}) => {
    // state of collapse open or not
    const [collapseOpen, setCollapseOpen] = useState<boolean>(false);

    const columns: GridColDef[] = [
        {
            field: 'getMoneyDate',
            headerName: 'Get Money Date',
            type: 'date',
            width: 150,
            valueFormatter: (params: string) => dayjs(params).format(Util.getDateFormatString(navigator.language)),
        },
        {
            field: 'getMoneyType',
            headerName: 'Get Money Type',
            width: 150,
        },
        {
            field: 'record.owner',
            headerName: 'Owner',
            width: 150,
            valueGetter: (_value, row) => row.record.owner,
        },
        {
            field: 'record.marketplace',
            headerName: 'Marketplace Name',
            width: 150,
            valueGetter: (_value, row) => row.record.marketplace,
        },
        {
            field: 'originalMoney',
            headerName: 'Original Money',
            width: 120,
            type: "number",
            valueFormatter: (params: number) => `$${params.toFixed(2)}`
        },
        {
            field: 'interest',
            headerName: 'Interest/Div.',
            width: 120,
            type: "number",
            valueFormatter: (params: number) => `$${params.toFixed(2)}`
        },
    ];

    const confirmedColumns = columns.concat([{
        field: 'actions',
        type: 'actions',
        headerName: "Mark as not confirmed",
        width: 180,
        getActions: ({row}) => {
            if (row.getMoneyType === GetMoneyTypeStr.interest) {
                return [
                    <GridActionsCellItem
                        icon={<ClearIcon/>}
                        label="Mark as not confirmed"
                        onClick={() => {
                            model.removeConfirmedInterestDate(row.record.id, row.getMoneyDate);
                            refreshModel();
                        }}
                    />,
                ];
            }
            return [];
        },
    }]);

    const notConfirmedColumns = columns.concat([{
        field: 'actions',
        type: 'actions',
        headerName: "Confirm",
        width: 80,
        getActions: ({row}) => {
            const getMoneyDate = dayjs(row.getMoneyDate);
            const today = dayjs();
            // only show confirm action for dates current or past
            // and only for interest payouts before maturity
            if (row.getMoneyType === GetMoneyTypeStr.interest &&
                (today.isSame(getMoneyDate, 'date') || today.isAfter(getMoneyDate, 'date'))) {
                return [
                    <GridActionsCellItem
                        icon={<CheckIcon/>}
                        label="Confirm"
                        onClick={() => {
                            model.addConfirmedInterestDate(row.record.id, row.getMoneyDate);
                            refreshModel();
                        }}
                    />,
                ];
            }
            return [];
        },
    }]);

    const getRowId = (row: GetMoneyRecord) => {
        return row.record.id + row.getMoneyDate;
    };

    // divide into confirmed & not confirmed lists
    const [confirmedList, notConfirmedList] = getMoneyList.reduce((result: GetMoneyRecord[][], elem) => {
        if (elem.record.confirmedInterestDates === undefined) {
            result[1].push(elem);
            return result;
        }
        const getMoneyDate = dayjs(elem.getMoneyDate);
        if (elem.record.confirmedInterestDates.some((dateStr) =>
            getMoneyDate.isSame(dayjs(dateStr), 'date'))) {
            result[0].push(elem);
            return result;
        }
        result[1].push(elem);
        return result;
    }, [[], []]);

    // calculate stats based on getMoneyList
    let original = 0;
    let interest = 0;
    confirmedList.forEach((moneyRec) => {
        original += moneyRec.originalMoney;
        interest += moneyRec.interest;
    });
    let earliestDate: null | Dayjs = null; // for highlighting the rows with the closest get money date
    notConfirmedList.forEach((moneyRec) => {
        original += moneyRec.originalMoney;
        interest += moneyRec.interest;
        if (earliestDate === null) {
            earliestDate = dayjs(moneyRec.getMoneyDate);
        } else if (earliestDate.isAfter(dayjs(moneyRec.getMoneyDate), 'date')) {
            earliestDate = dayjs(moneyRec.getMoneyDate);
        }
    });
    const total = original + interest;

    // highlight the closest get money date row
    const getRowClassName = (params: GridRowClassNameParams) => {
        if (earliestDate == null) {
            return '';
        }
        if (earliestDate.isSame(dayjs(params.row.getMoneyDate), 'date')) {
            return "urgent-highlight";
        }
        return '';
    };


    return (
        <Box sx={{display: 'grid'}}>
            <List sx={{mb: 5}}>
                <ListItemButton onClick={() => setCollapseOpen(!collapseOpen)}>
                    <ListItemText>
                        {`There is/are ${confirmedList.length} confirmed interest payout(s).`}
                    </ListItemText>
                    {collapseOpen ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
                <Collapse in={collapseOpen} timeout="auto">
                    <ListItem>
                        <DataGrid columns={confirmedColumns} rows={confirmedList}
                                  getRowId={getRowId} autoHeight
                                  hideFooterPagination hideFooterSelectedRowCount
                                  initialState={{
                                      columns: {
                                          columnVisibilityModel: {
                                              originalMoney: false,
                                          }
                                      },
                                  }}
                        />
                    </ListItem>
                </Collapse>
            </List>
            <DataGrid columns={notConfirmedColumns} rows={notConfirmedList}
                      getRowId={getRowId}
                      getRowClassName={getRowClassName}
                      autoHeight
                      sx={{
                          "& .urgent-highlight": {
                              backgroundColor: "warning.dark",
                              color: "warning.contrastText",
                              "&:hover": {
                                  backgroundColor: "warning.main"
                              }
                          },
                          "& .Mui-selected.urgent-highlight": {
                              backgroundColor: "warning.main",
                              "&:hover": {
                                  backgroundColor: "warning.light"
                              }
                          },
                          "& .urgent-highlight .MuiButtonBase-root": {
                              color: "warning.contrastText",
                          }
                      }}
                      slots={{
                          footer: CustomFooter,
                      }}
                      slotProps={{
                          footer: {original, interest, total} as FooterPropsOverrides,
                      }}
                      initialState={{
                          sorting: {
                              sortModel: [{field: 'getMoneyDate', sort: 'asc'}],
                          },
                      }}/>
        </Box>
    );
};

export default GetMoneyDateTable;