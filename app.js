const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "cricketMatchDetails.db");

let db = null;
const initializedbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
  }
};
initializedbAndServer();

app.get("/players/", async (request, response) => {
  const getPlayerQuery = `
    SELECT player_id AS playerId,
    player_name AS playerName FROM player_details`;
  const playerDetails = await db.all(getPlayerQuery);
  response.send(playerDetails);
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayer = `SELECT player_id AS playerId, player_name AS playerName FROM player_details WHERE player_id = ${playerId}`;
  const player = await db.get(getPlayer);
  response.send(player);
});

app.put("/players/:playerId/", async (request, response) => {
  const playerId = request.params.playerId;
  const updatePlayerDetails = `
    UPDATE player_details 
    SET 
    player_name = "Raju" 
    WHERE player_id = ${playerId}`;
  const updatePlayer = await db.run(updatePlayerDetails);
  response.send("Player Details Updated");
});

app.get("/matches/:matchId/", async (request, response) => {
  const matchId = request.params.matchId;
  const getMatchQuery = `
    SELECT match_id AS matchId,
    match, year 
    FROM 
    match_details 
    WHERE 
    match_id = ${matchId}`;
  const match = await db.get(getMatchQuery);
  response.send(match);
});

app.get("/players/:playerId/matches", async (request, response) => {
  const playerId = request.params.playerId;
  const getMatchesQuery = `
    SELECT 
    match_id AS matchId, match, year
    FROM 
    player_match_score NATURAL JOIN match_details
    WHERE 
    player_id = ${playerId}`;
  const matchDetails = await db.all(getMatchesQuery);
  response.send(matchDetails);
});

app.get("/matches/:matchId/players", async (request, response) => {
  const matchId = request.params.matchId;
  const getMatchPlayers = `
    SELECT player_details.player_id AS playerId,
    player_details.player_name AS playerName
    FROM player_details JOIN player_match_score ON
    player_details.player_id = player_match_score.player_id
    WHERE player_match_score.match_id = ${matchId}`;
  const match = await db.all(getMatchPlayers);
  response.send(match);
});

app.get("/players/:playerId/playerScores", async (request, response) => {
  const playerId = request.params.playerId;
  const playerQuery = `SELECT
  player_match_score.player_id AS playerId,
  player_details.player_name As playerName,
  SUM(player_match_score.score) AS totalScore,
  SUM(fours) AS totalFours,
  SUM(sixes) AS totalSixes FROM player_match_score NATURAL JOIN player_details
  WHERE player_details.player_id = ${playerId} `;

  const getMatch = await db.get(playerQuery);
  response.send(getMatch);
});

module.exports = app;
