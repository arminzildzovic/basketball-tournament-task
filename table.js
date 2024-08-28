import TableRow from "./tableRow.js";

export default class Table {
    
    teams = [];
    // four rows of one group table
    tableRows = [];
    constructor(teams) {
        this.teams = teams;    
        for (let i = 0; i < teams.length; i++) {
            this.tableRows.push(new TableRow(teams[i].isoName));
        }
        
    }

}