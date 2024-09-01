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

    teamRow(isoName) {
        for (let row of this.tableRows) {
            if (row.name === isoName) {
                return row;
            }
        }
    }

    sortTable(date) {
        this.tableRows.sort((a,b) => { 
            return b.pts - a.pts; 
        });
        
        let currentPoints = 0;
        let numberOfSamePts = 1;
        for (let i = 0; i < this.tableRows.length; i++) {
            if (currentPoints === this.tableRows[i].pts) {
                numberOfSamePts++;
            } else {
                if (numberOfSamePts == 2) {
                    this.sortTwoTeams(i - 2, date);
                } 
                if (numberOfSamePts == 3) {
                    this.sortThreeTeams(i - 3, date);
                }
                currentPoints = this.tableRows[i].pts;
                numberOfSamePts = 1;
            }
        }
        if (numberOfSamePts == 2) {
            this.sortTwoTeams(this.tableRows.length - 2, date);
        }
        if (numberOfSamePts == 3) {
            this.sortThreeTeams(this.tableRows.length - 3, date);
        }
        console.log(this.tableRows);
    }

    getTeamFromRow(row) {
        for (let team of this.teams) {
            if (team.isoName === row.name) {
                return team;
            }
        }
    }

    sortTwoTeams(index, date) {
        let team1 = this.getTeamFromRow(this.tableRows[index]);
        let team2 = this.getTeamFromRow(this.tableRows[index + 1]);
        let history1 = team1.history;
        for (let match of history1.matches) {
            if (match.teamR != undefined && match.teamR.isoName === team2.isoName && match.date === date) {
                let array1 = this.tableRows.slice(0, index);
                let array2 = this.tableRows.slice(index, index + 2).sort((a, b) => {
                    if (!match.result.leftTeamWon) return -1;
                    else return 1;
                })
                let array3 = this.tableRows.slice(index + 2, this.tableRows.length);

                this.tableRows = array1.concat(array2.concat(array3));
            }

        }
    }

    sortThreeTeams(index, date) {
        let row1 = this.tableRows[index];
        let row2 = this.tableRows[index + 1];
        let row3 = this.tableRows[index + 2];

        let team1 = this.getTeamFromRow(row1);
        let team2 = this.getTeamFromRow(row2);
        let team3 = this.getTeamFromRow(row3);

        // team that doesn't share the same points as the other three
        let otherTeam;
        if (index == 0) {
            otherTeam = this.getTeamFromRow(this.tableRows[index + 3]);
        } else {
            otherTeam = this.getTeamFromRow(this.tableRows[index - 1]);
        }

        row1.sortVar = row1.pointsDiff;
        row2.sortVar = row2.pointsDiff;
        row3.sortVar = row3.pointsDiff;

        let history1 = team1.history;
        let history2 = team2.history;
        let history3 = team3.history;

        row1.sortVar = this.getThreeTeamPointsDiff(row1.sortVar, otherTeam, history1, date);
        row2.sortVar = this.getThreeTeamPointsDiff(row2.sortVar, otherTeam, history2, date);
        row3.sortVar = this.getThreeTeamPointsDiff(row3.sortVar, otherTeam, history3, date);

        let array1 = this.tableRows.slice(0, index);
        let array2 = this.tableRows.slice(index, index + 3).sort((a, b) => {
            return b.sortVar - a.sortVar;
        });
        let array3 = this.tableRows.slice(index + 3, this.tableRows.length);

        this.tableRows = array1.concat(array2.concat(array3));
        
    }

    getThreeTeamPointsDiff(ptsDiff, otherTeam, history, date) {
        for (let match of history.matches) {
            if (match.teamR != undefined && match.teamR.isoName === otherTeam.isoName && match.date === date) {
                ptsDiff += match.result.pointsR - match.result.pointsL;
            }
        }
        return ptsDiff;
    }

    tableLog() {
        // console.log(this.tableRows);
    }

}


