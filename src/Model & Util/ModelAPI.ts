import {nanoid} from "nanoid";
import {BaseDirectory, createDir, writeTextFile} from "@tauri-apps/api/fs";

export enum CouponFreqStr {
    maturity = "at maturity",
    monthly = "monthly",
    semiannually = "semiannually"
}

export enum GetMoneyTypeStr {
    mature = "Mature",
    interest = "Interest" // before the product matures
}

export interface InvestmentRecord {
    id: string; // unique id of this record
    owner: string; // owner of this investment product
    marketplace: string; // name of the marketplace (can be brokerage or bank or brokerage IRA)
    bank: string; // name of the bank of the product (can be US treasuries too)
    quantity: number; // amount of money invested (don't consider buy price discount here)
    couponRate: number; // coupon rate (eg. 5%, couponRate = 0.05)
    startDate: string; // ISO format date string for product start date
    maturityDate: string; // ISO format date string for product maturity date
    firstCouponDate: string; // ISO format date string for the product first coupon date
    couponFreq: CouponFreqStr; // how frequent the interest is credited
}

export interface GetMoneyRecord {
    getMoneyDate: string; // ISO format date string for the get money date
    getMoneyType: GetMoneyTypeStr; // The type of the getting money event, see enum
    originalMoney: number; // The original portion of money that buys the product
    interest: number; // Interest or dividend earned till this get money date
    record: InvestmentRecord; // The corresponding investment record that generates this get money record
}

class ModelAPI {
    private recList: InvestmentRecord[];

    constructor(recList: InvestmentRecord[]) {
        this.recList = recList;
    }

    public getRecList(): InvestmentRecord[] {
        return [...this.recList];
    }

    public addRecord(owner: string, marketplace: string, bank: string,
                     quantity: number, couponRate: number, startDate: string, maturityDate: string,
                     firstCouponDate: string, couponFreq: CouponFreqStr): void {
        const rec: InvestmentRecord = {
            id: nanoid(),
            owner: owner,
            marketplace: marketplace,
            bank: bank,
            quantity: quantity,
            startDate: startDate,
            maturityDate: maturityDate,
            couponRate: couponRate,
            firstCouponDate: firstCouponDate,
            couponFreq: couponFreq
        };
        this.recList = this.recList.concat(rec);
        this.writeToJson();
    }

    public updateRec(updatedRec: InvestmentRecord) {
        this.recList = this.recList.map((rec) => {
            if (rec.id === updatedRec.id) {
                console.log("update successful");
                return updatedRec;
            }
            return rec;
        });
        this.writeToJson();
    }

    public deleteRec(id: string) {
        console.log(`in delete rec with id : ${id}`);
        this.recList = this.recList.filter((rec) => rec.id !== id);
        this.writeToJson();
    }

    public writeToJson(): void {
        createDir('Database', {dir: BaseDirectory.App, recursive: true})
            .then(() => {
                console.log("create dir success");
                writeTextFile('Database/recData.json', JSON.stringify({
                    recList: this.recList
                }), {dir: BaseDirectory.App})
                    .then(() => {
                        console.log('write to json success');
                    })
                    .catch((e) => {
                        console.log(e);
                    });
            })
            .catch((e) => {
                console.log(e);
            });
        console.log(this.recList);
    }
}

export default ModelAPI;