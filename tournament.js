import fs from 'fs';
import Team from './team.js';
import Group from './group.js';
import Table from './table.js';
import { deepCopyArray } from './helper.js';

// number of groups
const NUM_OF_GROUPS = 3;

// number of teams per group
const NUM_OF_TEAMS  = 4;

export default class Tournament {

    // tournament groups
    groups = [];
    // all of the competing teams
    competingTeams = [];

    // create a new instance of the tournament
    constructor() {
        this.createGroups();
    }

    // createGroups by parsing the json files
    createGroups() {
        
        const groupData = fs.readFileSync("./json/groups.json", 'utf-8');

        // the whole file parsed;
        const jsonGroup = JSON.parse(groupData);
        
        // array of three groups
        const groupArray = [jsonGroup.A, jsonGroup.B, jsonGroup.C];

        let teamArray;

        for (let i = 0; i < NUM_OF_GROUPS; i++) {            
            // create new Group
            this.groups[i] = new Group();
            
            // current index of the team used to add the teams to the table
            let curInd = this.competingTeams.length;
            // insert the teams into the new group 
            // and insert the current team into all of the competing teams
            const teams = groupArray[i].map(data => {
                let newTeam = new Team(data.Team, data.ISOCode, data.FIBARanking);
                this.competingTeams.push(newTeam);
            })

            // create the array of teams in this group
            let teamArray = deepCopyArray(this.competingTeams.slice(curInd, curInd + NUM_OF_TEAMS));

            // create one table for each group
            let table = new Table(teamArray);
            
        }
        
    }
}