import {
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  MenuItem,
  Typography,
  Checkbox,
  ListItemText,
  SelectChangeEvent,
} from '@mui/material';
import * as React from 'react';
import { Team } from 'renderer/types';
import teams from '../data/nhlteams.json';

interface TeamSettingsProps {
  triggerUpdate: () => void;
}
const TeamSettings: React.FC<TeamSettingsProps> = ({triggerUpdate}): JSX.Element => {
  const [selectedTeams, setSelectedTeams] = React.useState<string[]>([]);
  const handleTeamSelect = (event: SelectChangeEvent<typeof selectedTeams>) => {
    const {
      target: { value },
    } = event;
    setSelectedTeams(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value,
    );
    window.electron.store.set('teamSettings.team', teams.find(team => team.name === value));
    triggerUpdate();
  };

  React.useEffect(() => {
    if (selectedTeams.length) {
      const selectedTeamArr: any[] = [];
      selectedTeams.forEach(selectedTeam => {
        selectedTeamArr.push(teams.find(team => team.name === selectedTeam));
      });
      window.electron.store.set('teamSettings.teams', selectedTeamArr)
    }
  }, [selectedTeams])


  React.useEffect(() => {
    if (window.electron.store.get('teamSettings.teams')) {
      setSelectedTeams(window.electron.store.get('teamSettings.teams').map((team: Team) => team.name))
      // window.electron.store.set('teamSettings.teams', [])
    }
  }, [])

  return (
    <>
      {teams && (
      <FormControl fullWidth variant="standard" disabled={!teams}>
        {selectedTeams && <InputLabel id="team-select-label" shrink={!!selectedTeams}>Select a team</InputLabel>}
        <Select
          labelId="team-select-label"
          id="team-select"
          multiple
          label={selectedTeams ? "Select a team" : ""}
          value={selectedTeams}
          onChange={handleTeamSelect}
          renderValue={(selected) => selected.join(', ')}
        >
          {teams?.map((team) => (
            <MenuItem key={team.name} value={team.name}>
              <Checkbox checked={selectedTeams?.indexOf(team.name) > -1} />
              <ListItemText primary={team.name} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      )}
    </>
  );
};

export default TeamSettings;
