export class TempSeries {

    public name?: string;
    public data?: Array<Object>;
    public allowPointSelect?: boolean;
    public type?: string;
    public yAxis?: number;
    public tooltip?: any;


    constructor(name: string) {
        this.name = name;
        this.allowPointSelect = true;
        this.data = [];
    }
}
