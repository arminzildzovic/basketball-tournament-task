import Table from './table.js';


// name of the group ('A', 'B', 'C')
// three rounds for each group
// one table instance

export default class Group {
    
    name = '';
    rounds = [];
    table = null;
    date = '';

    constructor(date) {
        this.date = date;
    }

    // start the group competition 
    startGroups() {
        for (let round of this.rounds) {
            round.startRound();

            // update the table
            for (let match of round.matches) {
                let matchResult = match.result;
                let leftTeamRow = this.table.teamRow(match.teamL.isoName);
                let rightTeamRow = this.table.teamRow(match.teamR.isoName);
                
                // continue - update all stats
                let winnerRow;
                let loserRow;
                if (matchResult.leftTeamWon) {
                    winnerRow = leftTeamRow;
                    loserRow = rightTeamRow;
                } else {
                    winnerRow = rightTeamRow;
                    loserRow = leftTeamRow;
                }

                winnerRow.pts           += 2;
                winnerRow.pointsFor     += Math.max(matchResult.pointsL, matchResult.pointsR);
                winnerRow.pointsAgainst += Math.min(matchResult.pointsL, matchResult.pointsR);
                winnerRow.pointsDiff     = winnerRow.pointsFor - winnerRow.pointsAgainst;

                loserRow.pts            += 1;
                loserRow.pointsFor      += Math.min(matchResult.pointsL, matchResult.pointsR);
                loserRow.pointsAgainst  += Math.max(matchResult.pointsL, matchResult.pointsR);
                loserRow.pointsDiff      = loserRow.pointsFor - loserRow.pointsAgainst;

            }
        }
        // sort the table
        this.sortTable(this.date);
    }

    sortTable(roundDate) {
        this.table.sortTable(roundDate);
    }
}