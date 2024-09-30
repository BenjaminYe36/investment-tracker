import React, {useEffect, useState} from "react";
import './App.css';
import MainContent from "./Components/MainContent";
import CssBaseline from '@mui/material/CssBaseline';
import useMediaQuery from '@mui/material/useMediaQuery';
import {ThemeProvider} from '@mui/material/styles';
import {createTheme} from "@mui/material";
import {indigo, teal} from "@mui/material/colors";
import ModelAPI, {InvestmentRecord} from "./Model & Util/ModelAPI.ts";
import Settings from "./Model & Util/Settings.ts";
import {BaseDirectory, readTextFile} from "@tauri-apps/api/fs";
import {Dayjs} from "dayjs";

interface RecData {
    recList: InvestmentRecord[];
}

const defaultRecData = '{"recList": []}';

let model: ModelAPI = new ModelAPI([]);

export const ColorModeContext = React.createContext({
    toggleColorMode: () => {
    }
});

const App: React.FC = () => {
    const [recList, setRecList] = useState<InvestmentRecord[]>([]);
    const [mode, setMode] =
        useState<'light' | 'dark'>(useMediaQuery('(prefers-color-scheme: dark)') ? 'dark' : 'light');

    const colorMode = React.useMemo(
        () => ({
            toggleColorMode: () => {
                setMode((prevMode) => {
                    // get newMode based on prevMode value
                    const newMode = prevMode === 'light' ? 'dark' : 'light';
                    // write new settings to disk
                    Settings.changeTheme(newMode).then(() => console.log('update theme success'));
                    return newMode;
                });
            },
        }),
        [],
    );

    // customized palette in both dark and light mode
    const getDesignTokens = (mode: 'light' | 'dark') => ({
        palette: {
            mode,
            primary: {
                ...teal,
                ...(mode === 'dark' && {
                    main: teal[700],
                }),
            },
            secondary: {
                ...indigo,
                ...(mode === 'dark' && {
                    main: indigo[400],
                }),
            },
        },
    });

    const theme = React.useMemo(
        () => createTheme(getDesignTokens(mode)),
        [mode]);

    // model init related
    const initializeModel = (obj: RecData) => {
        model = new ModelAPI(obj.recList);
        model.writeToJson();
        refreshModel();
    };

    const refreshModel = () => {
        setRecList([...model.getRecList()]);
        setOwnerChecked(new Set(model.getRecList().map(rec => rec.owner)));
        setMarketChecked(new Set(model.getRecList().map(rec => rec.marketplace)));
        setBankChecked(new Set(model.getRecList().map(rec => rec.bank)));
    };

    useEffect(() => {
        readTextFile('Database/recData.json', {dir: BaseDirectory.App})
            .then((contents) => {
                console.log('found existing file');
                const obj = JSON.parse(contents);
                initializeModel(obj);
            })
            .catch((e) => {
                // most likely file doesn't exist
                console.log('no existing file found');
                console.log(e);
                const obj = JSON.parse(defaultRecData);
                initializeModel(obj);
            });
        Settings.getTheme(mode).then((theme) => setMode(theme));
    }, []);

    // The filters related state, in the set means include
    const [ownerChecked, setOwnerChecked] =
        useState<Set<string>>(new Set());

    const handleOwnerToggle = (owner: string, isOnly?: boolean) => {
        let updatedOwnerChecked = new Set<string>();
        if (isOnly === true) { // make all other unchecked except the owner arg passed in
            updatedOwnerChecked.add(owner);
        } else { // Normal toggle logic
            updatedOwnerChecked = new Set(ownerChecked);
            if (!updatedOwnerChecked.has(owner)) { // not in the list, add to the list
                updatedOwnerChecked.add(owner);
            } else { // already in the list, remove it from the list
                updatedOwnerChecked.delete(owner);
            }
        }
        setOwnerChecked(updatedOwnerChecked);
    };

    // The filters related state, in the set means include
    const [marketChecked, setMarketChecked] =
        useState<Set<string>>(new Set());

    const handleMarketToggle = (marketplace: string, isOnly?: boolean) => {
        let updatedMarketToggle = new Set<string>();
        if (isOnly === true) { // make all other unchecked except the marketplace arg passed in
            updatedMarketToggle.add(marketplace);
        } else { // Normal toggle logic
            updatedMarketToggle = new Set(marketChecked);
            if (!updatedMarketToggle.has(marketplace)) { // not in the list, add to the list
                updatedMarketToggle.add(marketplace);
            } else { // already in the list, remove it from the list
                updatedMarketToggle.delete(marketplace);
            }
        }
        setMarketChecked(updatedMarketToggle);
    };

    // The filters related state, in the set means include
    const [bankChecked, setBankChecked] = useState<Set<string>>(new Set());

    const handleBankToggle = (bank: string, isOnly?: boolean) => {
        let updatedBankToggle = new Set<string>();
        if (isOnly === true) { // make all other unchecked except the bank arg passed in
            updatedBankToggle.add(bank);
        } else { // Normal toggle logic
            updatedBankToggle = new Set(bankChecked);
            if (!updatedBankToggle.has(bank)) { // not in the list, add to the list
                updatedBankToggle.add(bank);
            } else { // already in the list, remove it from the list
                updatedBankToggle.delete(bank);
            }
        }
        setBankChecked(updatedBankToggle);
    };

    // filter related states & functions
    const [filterStartDate, setFilterStartDate] = useState<null | Dayjs>(null);
    const [filterEndDate, setFilterEndDate] = useState<null | Dayjs>(null);

    const resetFilters = () => {
        setOwnerChecked(new Set(model.getRecList().map(rec => rec.owner)));
        setMarketChecked(new Set(model.getRecList().map(rec => rec.marketplace)));
        setBankChecked(new Set(model.getRecList().map(rec => rec.bank)));
        setFilterStartDate(null);
        setFilterEndDate(null);
    };

    return (
        <ColorModeContext.Provider value={colorMode}>
            <ThemeProvider theme={theme}>
                <CssBaseline enableColorScheme/>
                <MainContent recList={recList} model={model} refreshModel={refreshModel}
                             ownerChecked={ownerChecked} handleOwnerToggle={handleOwnerToggle}
                             marketChecked={marketChecked} handleMarketToggle={handleMarketToggle}
                             bankChecked={bankChecked} handleBankToggle={handleBankToggle}
                             filterStartDate={filterStartDate} filterEndDate={filterEndDate}
                             setFilterStartDate={setFilterStartDate} setFilterEndDate={setFilterEndDate}
                             resetFilters={resetFilters}/>
            </ThemeProvider>
        </ColorModeContext.Provider>
    );
};

export default App;
