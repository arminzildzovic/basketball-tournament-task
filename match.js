import Result from './result.js'
import { logisticFunction, calcProbability, calcPtsDiffProbability, calcMean, calcStdDeviation, randomNumber } from './helper.js';

// probability factors
const FACTOR_FIBA           = 0.65;
const FACTOR_WR             = 0.05;
const FACTOR_OPPONENT       = 0.15;
const FACTOR_PTS_DIFF       = 0.1;
const FACTOR_NEGATIVE       = 0.05;


// logistic function arguments
const LOGISTIC_K            = 0.09982023555;
const LOGISTIC_X0           = -1.82358733;

/* used to calculate the probability of winning based on the strength of the previous opponents
/  each team is assigned a number based on their FIBA ranking */
const MEMBERS_PER_TIER      = 1;
const NUMBER_OF_TIERS       = 50;

const POOR_PTS_DIFF         = 15;

// lowest score to consider
const LOWEST_SCORE          = 60;
const HIGHEST_SCORE         = 130;

// score difference - normal distribution
const MEAN_PTS_DIFF         = 12.2352941176;
const STD_DEV_PTS_DIFF      = 7.3125951920578;

// factors used to calculate the score difference
const PTS_DIFF_FACT_HISTORY = 0.4;
const PTS_DIFF_FACT_FIBA    = 0.6;

const PTS_DIFF_HIGH         = 30;

const HIGHEST_FIBA_RANKING  = 33;

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
        this.calculateScore();
        console.log(this.result);
    
    }

    // Pick a winner first and the calculate the score
    calculateScore() {
        let fibaProb;
        let wrProb;
        // console.log("\ncalculateScore");
        // console.log(this.teamL.isoName);
        // console.log(this.teamR.isoName);
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

        // probability to win based on win rate
        let historyL = this.teamL.history;
        let historyR = this.teamR.history;
        
        let leftTeamGrade = this.getPerformancePoints(historyL);
        let rightTeamGrade = this.getPerformancePoints(historyR);

        wrProb = calcProbability(leftTeamGrade.wonNum, rightTeamGrade.wonNum);

        // probability to win based on the strength of the opposing team
        let opponentProb = calcProbability(leftTeamGrade.opponents, rightTeamGrade.opponents);

        // probability to win based on the points difference
        let leftPoints = leftTeamGrade.ptsDiff;
        let rightPoints = rightTeamGrade.ptsDiff;

        let ptsDiffProb = calcPtsDiffProbability(leftPoints, rightPoints);

        // negative points probability (reverse the sides for probability calc)
        let negPointsProb = calcProbability(rightTeamGrade.negativePoints, leftTeamGrade.negativePoints);

        // final probability
        let prob =  fibaProb * FACTOR_FIBA +
                    wrProb * FACTOR_WR + 
                    opponentProb * FACTOR_OPPONENT + 
                    ptsDiffProb * FACTOR_PTS_DIFF +
                    negPointsProb * FACTOR_NEGATIVE
                    ;

        // declare the winner
        let leftWon = false;
        let winProb = prob;
        let winningTeam;
        let losingTeam;
        if (Math.random() < prob) {
            leftWon = true;
            winningTeam = this.teamL;
            losingTeam = this.teamR;
        } else {
            winningTeam = this.teamR;
            losingTeam = this.teamL;
            winProb = 1 - winProb;
        }

        // create winning team's PF
        let winnerPts = this.calculateWinnerPoints(winningTeam, losingTeam);

        // points difference 
        let scoreDifference = this.calculateScoreDifference(winningTeam, losingTeam, winProb);
        let loserPts = winnerPts - scoreDifference;

        let reverseMatch = new Match(this.teamR, this.teamL, this.date);
        let reverseResult;
        if (leftWon) {
            this.result = new Result(winnerPts, loserPts);
            reverseResult = new Result(loserPts, winnerPts);
        } else {
            this.result = new Result(loserPts, winnerPts);
            reverseResult = new Result(winnerPts, loserPts);
        }
        this.finished = true;
        reverseMatch.finished = true;
        reverseMatch.result = reverseResult;

        // insert match into both teams' history
        this.teamL.addToHistory(this);
        this.teamR.addToHistory(reverseMatch);
    }

    getPerformancePoints(history) {
        let wonNum = 0;
        let negativePoints = 0;
        let opponentPoints = 0;
        let ptsDiffPoints = 0;

        for (let match of history.matches) {
            if (match.finished) {
                if (match.result.leftTeamWon) {
                    wonNum++;
                    if (match.teamR.fiba < MEMBERS_PER_TIER * NUMBER_OF_TIERS) {
                        opponentPoints += NUMBER_OF_TIERS + 1 - Math.ceil(match.teamR.fiba / MEMBERS_PER_TIER);
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
        }
        
        return {
            "matches":          history.matches.length,
            "wonNum":           wonNum,
            "opponents":        opponentPoints,
            "ptsDiff":          ptsDiffPoints,
            "negativePoints":   negativePoints
        }
    }

    calculateWinnerPoints(winner, wrProb) {
        let mean = 85;
        let stdDeviation = 5;
        let ptsFor = [];
        for (let match of winner.history.matches) {
            if (match.finished) {
                ptsFor.push(match.result.pointsL);
            }
        }
        if (ptsFor.length > 0) {
            mean = calcMean(ptsFor);
            stdDeviation = calcStdDeviation(ptsFor, mean);
            if (stdDeviation < 1) {
                stdDeviation = 1;
            }
        }
        
        let gaussRnd = randomNumber(mean, stdDeviation, LOWEST_SCORE, HIGHEST_SCORE);
        
        const avgPoints = 100;
        const avgFactor = 0.1;
        const gaussFactor = 0.9;


        let res =   gaussRnd * gaussFactor +
                    avgPoints * avgFactor 
                    ;

        return Math.round(res);
    }

    calculateScoreDifference(winner, loser, wr) {

        // average match based random number
        let ptsDiffNormalDist = Math.abs(randomNumber(MEAN_PTS_DIFF, STD_DEV_PTS_DIFF, -PTS_DIFF_HIGH, PTS_DIFF_HIGH));
        
        // fiba
        let fibaDiff = loser.fiba - winner.fiba;
        const kArgFiba = 0.06289612016;
        const x0ArgFiba = 9.95898447436;
        const limitArgFiba = 30;

        let ptsDiffLogistic = limitArgFiba * logisticFunction(kArgFiba, x0ArgFiba, fibaDiff);

        // probability of the winner winning
        const kArgProb = 4.882721282;
        const x0ArgProb = 0.725;
        const limitArgProb = 40;

        // console.log("wr");
        // console.log(wr);
        // console.log(fibaDiff);
        let probLogistic = limitArgProb * logisticFunction(kArgProb, x0ArgProb, wr);
        
        // average difference
        const avgDifference = 7;

        // factors
        const normalDistFact = 0.3;
        const logisticFact = 0.25;
        const probFact = 0.25;
        const avgFact = 0.2;


        let res =   Math.round(Math.abs(
            ptsDiffNormalDist * normalDistFact +
            ptsDiffLogistic * logisticFact +
            probLogistic * probFact +
            avgDifference * avgFact
        ));

        // console.log(ptsDiffNormalDist);
        // console.log(ptsDiffLogistic);
        // console.log(probLogistic);
        //console.log(avgDifference);
        

        if (res < 1) {
            res = 1;
        }

        return res;
    }

    teamPlaysInMatch(team) {
        if (team.isoName === this.teamL.isoName || team.isoName === this.teamR.isoName) {
            return true;
        }
    }
}