/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import * as React from "react";
import useInterval from 'renderer/hooks/useInterval';
import { getCurrentGames } from 'renderer/services/teams';
import { HueSettingsStore, LightState, Team } from 'renderer/types';
import * as colorConverter from '../../main/utils/colorConverter';

export interface ScoreboardProps {
  team: Team
  hueSettings: HueSettingsStore
}

export const Scoreboard: React.FC<ScoreboardProps> = ({team, hueSettings}): JSX.Element => {
  const [teamScore, setTeamScore] = React.useState<number>();
  const [homeScore, setHomeScore] = React.useState<number>();
  const [awayScore, setAwayScore] = React.useState<number>();
  const [homeAway, setHomeAway] = React.useState<"home" | "away">();
  const [isLive, setIsLive] = React.useState<boolean>(true);

  // eslint-disable-next-line @typescript-eslint/no-shadow
  const triggerLight = (team: Team) => {
    if (hueSettings?.light) {
      let existingState: LightState;
      window.electron.hueApi.getLightState(hueSettings.bridgeIpAddress, hueSettings.username, hueSettings.light.data.id).then((state: LightState) => {
        existingState = state;
        return new Promise((resolve) => {
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

  React.useEffect(() => {
    if (team) {
      if (team.currentGame.teams.away.team.id === team.id) {
        setHomeAway("away")
      }
      else if (team.currentGame.teams.home.team.id === team.id) {
        setHomeAway("home");
      }
    }

  }, [team])

  React.useEffect(() => {
    if (homeAway) {
      setTeamScore(team.currentGame.teams[homeAway].score);
    }
  }, [homeAway, team.currentGame.teams]);

  useInterval(() => {
    if (homeAway) {
      getCurrentGames().then(games => {
        const currentGame = games.find((game: any) => {
          return game.teams[homeAway].team.id === team.id;
        });
        if (currentGame && currentGame.status.abstractGameState === "Live") {
          setAwayScore(currentGame.teams.away.score);
          setHomeScore(currentGame.teams.home.score);
          if (teamScore) {
            if (currentGame.teams[homeAway].score > teamScore) {
              console.log(`GOAL! ${team.currentGame.teams[homeAway].team.name}`);
              triggerLight(team);
              setTeamScore(currentGame.teams[homeAway].score);
            }
          }
        }
        else {
          setIsLive(false);
        }
        return null;
      }).catch(err => {
        console.error(err);
      })
    }
  }, isLive ? 2000 : null)

  return (
    <>
      <div css={css`
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        padding-left: 25%;
        padding-right: 25%;
      `}>
        <div css={css`
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;
          gap: 25px;
        `}>
          {team.currentGame.teams.away.team.name}
          <div css={css`
            border: 2px solid white;
            height: 50px;
            width: 50px;
            font-size: 2rem;
            text-align: center;
            border-radius: 5px;
          `}>
            {awayScore}
          </div>
        </div>
        <div css={css`
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;
          gap: 25px;
        `}>
          <div css={css`
            border: 2px solid white;
            height: 50px;
            width: 50px;
            font-size: 2rem;
            text-align: center;
            border-radius: 5px;
          `}>
            {homeScore}
          </div>
          {team.currentGame.teams.home.team.name}
        </div>
      </div>
    </>
  )
};
