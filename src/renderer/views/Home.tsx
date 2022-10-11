import { Box, Button, Divider, Typography } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import { parseISO, format, isAfter, isSameDay } from 'date-fns';
import * as React from 'react';
import { getAllTeams, getCurrentGames, getNextGame, getTeam } from 'renderer/services/teams';
import { Scoreboard } from 'renderer/components/Scoreboard';
import { HueSettingsStore, Team, TeamSettingsStore } from 'renderer/types';
import { useNavigate } from 'react-router-dom';

const Home = (): JSX.Element => {
  const [hueSettings, setHueSettings] = React.useState<HueSettingsStore>();
  const [teamSettings, setTeamSettings] = React.useState<TeamSettingsStore>();
  const [teams, setTeams] = React.useState<any []>([]);
  const [games, setGames] = React.useState<any []>([]);
  const navigate = useNavigate();
  React.useEffect(() => {
    // window.electron.store.set('teamSettings.teams', [])
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const hueSettings = window.electron.store.get('hueSettings')
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const teamSettings = window.electron.store.get('teamSettings')
    setHueSettings(hueSettings);
    setTeamSettings(teamSettings);

    if (teamSettings?.teams) {
      setTeams([]);
      const defineGames = async () => {
        const currentGames = await getCurrentGames().catch(err => console.error(err));
        teamSettings.teams.forEach((team: Team) => {
          getNextGame(team.id).then(response => {
            team.nextGame = response.nextGameSchedule.dates[0].games[0].gameDate;
            if (team.nextGame && isSameDay(parseISO(team.nextGame), new Date())) {
              // eslint-disable-next-line @typescript-eslint/no-shadow
              const game = currentGames.find((game: any) => {
                return game.teams.away.team.id === team.id || game.teams.home.team.id === team.id;
              });
              if (game && isAfter(new Date(), parseISO(game.gameDate)) && game.status.abstractGameState === "Live") {
                team.currentGame = game;
              }
            }
            // eslint-disable-next-line @typescript-eslint/no-shadow
            setTeams((teams) => [...teams, team]);
            return null;
          }).catch(err => console.error(err));
        })
      }
      defineGames();
    }
  }, [])

  return (
    <>
      <Typography variant="h5" gutterBottom sx={{width: '100%', textAlign: 'center', marginTop: '25px'}}>
        Woohue
      </Typography>
      { (hueSettings && teamSettings) &&
        <Box sx={{padding: '15px'}}>
          <>
            {teams.length > 0 && teams.map(team => (
              <div key={team.id}>
                <Divider sx={{ marginBottom: '15px', marginTop: '15px'}}>{team.name}</Divider>
                {team.currentGame ?
                  <>
                    <Scoreboard team={team} hueSettings={hueSettings} />
                  </>
                  :
                  <>Next Game: { format(new Date(team?.nextGame), "EEEE MMMM do, yyyy 'at' h:mm a") }</>
                }
              </div>
            ))}
          </>
        </Box>
      }
      {
        (!hueSettings || !teamSettings) &&
        <Box sx={{padding: '15px'}}>
          <div>
            Please configure your settings to use Woohue.
          </div>
          <div>
            <Button
              onClick={() => {
                navigate('/settings');
              }}
              startIcon={<SettingsIcon />}
            >Open Settings</Button>
          </div>
        </Box>
      }
    </>
  );
};

export default Home;
