/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Box, Button, Card, CardContent, Divider, Stack, Tab, Tabs, Typography } from '@mui/material';
import * as React from 'react';
import { HueSettingsStore, LightState, TeamSettingsStore } from 'renderer/types';
import HueSettings from '../components/HueSettings';
import TeamSettings from '../components/TeamSettings';
import nhlteams from '../data/nhlteams.json';
import * as colorConverter from '../../main/utils/colorConverter';

const Settings: React.FC = (): JSX.Element => {
  const [hueSettings, setHueSettings] = React.useState<HueSettingsStore>()
  const [teamSettings, setTeamSettings] = React.useState<TeamSettingsStore | undefined>()
  const [disableSave, setDisableSave] = React.useState<boolean>(true)
  const [disableTest, setDisableTest] = React.useState<boolean>(true)
  const [disableReset, setDisableReset] = React.useState<boolean>(true);

  const triggerUpdate = () => {
    if (window.electron.store.get('hueSettings')) {
      setHueSettings(window.electron.store.get('hueSettings'));
    }
    if (window.electron.store.get('teamSettings')) {
      setTeamSettings(window.electron.store.get('teamSettings'));
    }
  }
  React.useEffect(() => {
    triggerUpdate();
  }, []);

  React.useEffect(() => {
    if (hueSettings?.bridgeIpAddress && hueSettings) {
      setDisableSave(false);
    }
    if (teamSettings?.teams.length) {
      setDisableTest(false);
    }
    if (teamSettings || hueSettings) {
      setDisableReset(false);
    }
  }, [hueSettings, teamSettings])

  const testSettings = () => {
    if (hueSettings?.light) {
      let existingState: LightState;
      window.electron.hueApi.getLightState(hueSettings.bridgeIpAddress, hueSettings.username, hueSettings.light.data.id).then((state: LightState) => {
        existingState = state;
        return new Promise((resolve) => {
          const team = teamSettings?.teams[0];
          if (team) {
            const teamColors: string[] = [team.primaryColor, team.secondaryColor];
            console.log(teamColors);
            const xyColors = teamColors.map((color: string) => {
              const xy = colorConverter.hexStringToXyBri(color.replace('#',''))
              return xy
            });
            // eslint-disable-next-line promise/no-nesting, no-plusplus
            for (let i = 0; i < 6; i++) {
              setTimeout(() => {
                if (hueSettings.light?.data.type.toLowerCase().includes("color")) {
                  try {
                    window.electron.hueApi.setLightColor(hueSettings.bridgeIpAddress, hueSettings.username, hueSettings.light.data.id, xyColors[i%xyColors.length]);
                  }
                  catch (e) {
                    console.error(e);
                  }
                }
              }, i * 1250);
            }
            // eslint-disable-next-line promise/catch-or-return
            setTimeout(resolve, 8750);
          }
        });
      // eslint-disable-next-line promise/always-return
      }).then(() => {
        if (hueSettings?.light?.data?.id) {
          window.electron.hueApi.setLightState(hueSettings.bridgeIpAddress, hueSettings.username, hueSettings?.light?.data?.id, existingState);
        }
        return null;
      }).catch((err: Error) => { console.error(err)});
    }
  }

  return (
    <>
      <Box sx={{ width: '100%', typography: 'body1', padding: '25px' }}>
        <Typography variant="h5" gutterBottom>
          Settings
        </Typography>
        <Divider sx={{ marginBottom: '15px', marginTop: '15px'}}>Philips Hue Settings</Divider>
        <HueSettings triggerUpdate={triggerUpdate} />
        <Divider sx={{ marginBottom: '15px', marginTop: '15px' }}>Team Settings</Divider>
        <TeamSettings triggerUpdate={triggerUpdate} />
        <div css={css`
          margin-top: 15px;
          display: flex;
          justify-content: space-between;
        `}>
          <Button disabled={disableTest} onClick={testSettings}>Test Settings</Button>
          <Button disabled={disableReset} color="error">Reset Settings</Button>
        </div>
      </Box>
    </>
  );
};

export default Settings;
