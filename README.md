# Basketball Olympics Tournament Simulation

This project simulates a basketball tournament at the Olympic Games, covering both the group and elimination stages. The simulation is written in JavaScript (Node v20.17.0) without using any external packages.

## Features

Simulates group stage matches based on FIBA rankings

Ranks teams according to tournament rules

Draws elimination stage matchups with specific constraints

Simulates elimination matches up to the finals

Displays results for all stages

## Getting started

### Prerequisites

Node.js v20.17.0

### Installation

1. Install node.js

2. Clone the repository

3. Navigate to the project directory

4. Start the simulation, using npm start

## Project Structure

groups.json: Contains information on groups, teams, country names, ISO-3166 codes, and FIBA rankings.

exhibitions.json: (Bonus) Includes results from friendly matches to account for team form.

index.js: Main script that handles the tournament simulation.

## Simulation Logic

Group Stage

Each team plays against the other three teams in its group.

Points awarded:

2 points for a win

1 point for a loss

Teams are ranked based on:

Total points

Head-to-head results (if tied)

Point difference in head-to-head games (if three teams are tied)

Advancement to Elimination Stage

The top 3 teams from each group are ranked (1 to 9):

Group winners ranked 1-3

Group runners-up ranked 4-6

Third-place teams ranked 7-9

The top 8 teams advance; the 9th-ranked team is eliminated.

Draw for Elimination Stage

Teams are divided into 4 pots:

Pot D: Ranks 1 & 2

Pot E: Ranks 3 & 4

Pot F: Ranks 5 & 6

Pot G: Ranks 7 & 8

### Rules:

Teams from Pot D face teams from Pot G.

Teams from Pot E face teams from Pot F.

Teams that played each other in the group stage cannot meet in the quarterfinals.

### Elimination Stage

Quarterfinals → Semifinals → Finals & 3rd Place Match

Winners advance, losers are eliminated (except for semifinal losers who play for bronze).

## Output structure:

1. Group stages results per round.

2. Final group rankings with stats for wins, defeats, total points, points for, points against and points difference.

3. Pots generated after the group stage.

4. Matches generated from the pots created.

5. Quarterfinals, semifinals, match for third place, and finals results.

6. Finally, the first, second and third places are displayed.

## Bonus Features

To simulate the match results, the data from exhibitions.json and FIBA rankings are taken into consideration to make the match result as realistic as possible.

## License

This project is open-source and free to use.
