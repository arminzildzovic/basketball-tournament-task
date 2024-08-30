import Result from './result.js'
import { logisticFunction, calcProbability, calcPtsDiffProbability } from './helper.js';

const FACTOR_FIBA           = 0.65;
const FACTOR_WR             = 0.05;
const FACTOR_OPPONENT       = 0.15;
const FACTOR_PTS_DIFF       = 0.1;
const FACTOR_NEGATIVE       = 0.05;


// logistic function arguments
const LOGISTIC_K            = 0.09982023555;
const LOGISTIC_X0           = -1.82358733;

/* each bonus points tier is 5 
/  so opponent with fiba ranking of 1-5 will give 5 bonus points, ranking of 6-10 will give 4 bonus points 
/  until ranking TIER_FIBA_MEMBER * TIER_NUMBER*/
const TIER_FIBA_MEMBER      = 1;
const TIER_NUMBER           = 50;

const POOR_PTS_DIFF         = 15;

// two teams and a result
export default class Match {
    teamL = null;
    teamR = null;
    result = null;
    finished = false;
    date = '';

    constructor(teamLeft, teamRight, date) {
        this.teamL = teamLeft;
        this.teamR = teamRight;
        this.date = date;
    }

    // Calculate the score and update the team's histories
    finishMatch() {
        this.finished = true;
        this.calculateScore();
        
        
    }

    // Pick a winner first and the calculate the score
    calculateScore() {
        let fibaProb;
        let wrProb;
        console.log("\ncalculateScore");
        console.log(this.teamL.isoName);
        console.log(this.teamR.isoName);
        let leftWinPred = false;
        if (this.teamL.fiba < this.teamR.fiba) {
            leftWinPred = true;
        }
        let fibaDiff = this.teamL.fiba - this.teamR.fiba;

        // logistic function to calculate probability of winning based on fiba difference
        fibaProb = logisticFunction(LOGISTIC_K, LOGISTIC_X0, Math.abs(fibaDiff));
        if (!leftWinPred) {
            fibaProb = 1 - fibaProb;
        }
        console.log("fiba");
        console.log(fibaProb);

        // probability to win based on win rate
        let historyL = this.teamL.history;
        let historyR = this.teamR.history;
        
        let leftTeamGrade = this.getPerformancePoints(historyL);
        let rightTeamGrade = this.getPerformancePoints(historyR);

        wrProb = calcProbability(leftTeamGrade.wonNum, rightTeamGrade.wonNum);
        
        console.log("wr");
        console.log(wrProb);

        // probability to win based on the strength of the opposing team
        let opponentProb = calcProbability(leftTeamGrade.opponents, rightTeamGrade.opponents);
        
        console.log("opponent");
        console.log(leftTeamGrade.opponents);
        console.log(rightTeamGrade.opponents);
        console.log(opponentProb);

        // probability to win based on the points difference
        let leftPoints = leftTeamGrade.ptsDiff;
        let rightPoints = rightTeamGrade.ptsDiff;
        
        //let ptsDiffProb = calcProbability(leftPoints - min, rightPoints - min);
        let ptsDiffProb = calcPtsDiffProbability(leftPoints, rightPoints);
        console.log("pts diff");
        console.log(leftPoints);
        console.log(rightPoints);
        console.log(ptsDiffProb);

        // negative points probability (reverse the sides for probability calc)
        let negPointsProb = calcProbability(rightTeamGrade.negativePoints, leftTeamGrade.negativePoints);

        console.log("neg");
        console.log(leftTeamGrade.negativePoints);
        console.log(rightTeamGrade.negativePoints);
        console.log(negPointsProb);

        // final probability
        let prob =  fibaProb * FACTOR_FIBA +
                    wrProb * FACTOR_WR + 
                    opponentProb * FACTOR_OPPONENT + 
                    ptsDiffProb * FACTOR_PTS_DIFF +
                    negPointsProb * FACTOR_NEGATIVE
                    ; 

        console.log("finalProb");
        console.log(prob);
        // new Result
        let leftWon = false;
        if (Math.random() < prob) {
            leftWon = true;
        }
        console.log(leftWon);

        // create result
        // insert match into both teams' history
        
    }

    getPerformancePoints(history) {
        let res = 0;
        let wonNum = 0;
        let negativePoints = 0;
        let opponentPoints = 0;
        let ptsDiffPoints = 0;
        for (let match of history.matches) {
            if (match.result.leftTeamWon) {
                wonNum++;
                if (match.teamR.fiba < TIER_FIBA_MEMBER * TIER_NUMBER) {
                    opponentPoints += TIER_NUMBER + 1 - Math.ceil(match.teamR.fiba / TIER_FIBA_MEMBER);
                }
            } else {
                if (match.teamR != undefined && match.teamR.fiba > match.teamL.fiba) {
                    negativePoints++;
                }
                
                if (match.result.pointsL < match.result.pointsR - POOR_PTS_DIFF) {
                    negativePoints++;
                }
            
            }
            ptsDiffPoints += match.result.pointsL - match.result.pointsR;
        }
        
        return {
            "matches":          history.matches.length,
            "wonNum":           wonNum,
            "opponents":        opponentPoints,
            "ptsDiff":          ptsDiffPoints,
            "negativePoints":   negativePoints
        }
    }
}