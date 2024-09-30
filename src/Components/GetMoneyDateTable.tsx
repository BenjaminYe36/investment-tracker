import React from "react";
import {GetMoneyRecord} from "../Model & Util/ModelAPI.ts";
import {Box, Typography} from "@mui/material";
import {
    DataGrid,
    FooterPropsOverrides,
    GridColDef,
    GridRowClassNameParams,
    GridSlotsComponentsProps
} from "@mui/x-data-grid";
import dayjs, {Dayjs} from "dayjs";
import Util from "../Model & Util/Util.ts";

interface GetMoneyTableProps {
    getMoneyList: GetMoneyRecord[]; // a list of all get money records after filtering
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

const GetMoneyDateTable: React.FC<GetMoneyTableProps> = ({getMoneyList}) => {
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

    const getRowId = (row: GetMoneyRecord) => {
        return row.record.id + row.getMoneyDate;
    };

    // calculate stats based on getMoneyList
    let original = 0;
    let interest = 0;
    let earliestDate: null | Dayjs = null; // for highlighting the rows with the closest get money date
    getMoneyList.forEach((moneyRec) => {
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
            <DataGrid columns={columns} rows={getMoneyList}
                      getRowId={getRowId}
                      getRowClassName={getRowClassName}
                      autoHeight
                      sx={{
                          "& .urgent-highlight": {
                              backgroundColor: "warning.dark",
                              "&:hover": {
                                  backgroundColor: "warning.main"
                              }
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