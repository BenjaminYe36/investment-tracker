import React from "react";
import {
    DataGrid, GridActionsCellItem,
    GridCellEditStopParams,
    GridCellEditStopReasons, GridCellParams,
    GridColDef,
    MuiEvent
} from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import ModelAPI, {CouponFreqStr, InvestmentRecord} from "../Model & Util/ModelAPI.ts";
import dayjs from "dayjs";
import clsx from 'clsx';
import {Box} from "@mui/material";
import Util from "../Model & Util/Util.ts";


interface RawDataTableProps {
    recList: InvestmentRecord[]; // List of investment record data
    model: ModelAPI; // Reference to the fake backend Api
    refreshModel(): void; // callback to refresh from backend after modifying
}

const RawDataTable: React.FC<RawDataTableProps> = ({recList, model, refreshModel}) => {
    // to prevent mistype directly in table edits, limit to existing owners in a single select format
    const ownerOptions = Array.from(new Set(model.getRecList().map(rec => rec.owner)));

    const columns: GridColDef[] = [
        {
            field: 'id',
            headerName: 'ID',
            width: 100,
        },
        {
            field: 'owner',
            headerName: 'Owner',
            type: "singleSelect",
            valueOptions: ownerOptions,
            width: 100,
            editable: true,
        },
        {
            field: 'marketplace',
            headerName: 'Marketplace',
            width: 130,
            editable: true,
        },
        {
            field: 'bank',
            headerName: 'Bank',
            width: 110,
            editable: true,
        },
        {
            field: 'quantity',
            headerName: 'Quantity',
            width: 100,
            editable: true,
            type: "number",
            valueFormatter: (params: number) => `$${params.toFixed(2)}`
        },
        {
            field: 'couponRate',
            headerName: 'Coupon',
            width: 100,
            editable: true,
            type: "number",
            valueFormatter: (params: number) => `${(params * 100.0).toFixed(2)}%`
        },
        {
            field: 'startDate',
            headerName: 'Start Date',
            type: 'date',
            width: 110,
            editable: true,
            valueFormatter: (params: string) => dayjs(params).format(Util.getDateFormatString(navigator.language)),
        },
        {
            field: 'maturityDate',
            headerName: 'Maturity Date',
            type: 'date',
            width: 150,
            editable: true,
            valueFormatter: (params: string) => dayjs(params).format(Util.getDateFormatString(navigator.language)),
            // If maturity date is today or before today, then need to highlight cell
            cellClassName: (params: GridCellParams<any, string>) =>
                clsx('maturity-date', {
                    "urgent-highlight": dayjs(params.value).isSame(dayjs(), 'date')
                        || dayjs(params.value).isBefore(dayjs(), 'date')
                }),
        },
        {
            field: 'firstCouponDate',
            headerName: 'First Coupon Date',
            type: 'date',
            width: 110,
            editable: true,
            valueFormatter: (params: string) => dayjs(params).format(Util.getDateFormatString(navigator.language)),
        },
        {
            field: 'couponFreq',
            headerName: 'Coupon Frequency',
            type: "singleSelect",
            valueOptions: Object.values(CouponFreqStr),
            width: 130,
            editable: true,
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: "Delete",
            width: 80,
            getActions: ({id}) => {
                return [
                    <GridActionsCellItem
                        icon={<DeleteIcon/>}
                        label="Delete"
                        onClick={() => {
                            model.deleteRec(id as string);
                            refreshModel();
                        }}
                        color="warning"
                    />,
                ];
            }
        },
    ];

    const handleSaveEdit = (updatedRow: InvestmentRecord, oldRow: InvestmentRecord) => {
        console.log("handle cell update save");
        if (JSON.stringify(updatedRow) == JSON.stringify(oldRow)) {
            console.log("nothing changed, won't call model update");
        } else {
            model.updateRec(updatedRow);
            refreshModel();
        }
        return updatedRow;
    };

    return (
        <Box sx={{display: 'grid'}}>
            {/*Disable edit stop save when clicking outside the cell, must press enter/tab to save, esc to cancel*/}
            {/*hide id column by default, sort by maturity date asc by default*/}
            <DataGrid columns={columns} rows={recList}
                      processRowUpdate={handleSaveEdit}
                      autoHeight
                      onCellEditStop={(params: GridCellEditStopParams, event: MuiEvent) => {
                          if (params.reason === GridCellEditStopReasons.cellFocusOut) {
                              event.defaultMuiPrevented = true;
                          }
                      }}
                      sx={{
                          "& .maturity-date.urgent-highlight": {
                              backgroundColor: 'warning.dark',
                          }
                      }}
                      initialState={{
                          columns: {
                              columnVisibilityModel: {
                                  id: false,
                              }
                          },
                          sorting: {
                              sortModel: [{field: 'maturityDate', sort: 'asc'}],
                          },
                      }}/>
        </Box>
    );
};

export default RawDataTable;