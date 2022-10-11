/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import * as React from 'react';
import './GoalLight.css';

export interface GoalLightProps {
  on: boolean;
}

export const GoalLight: React.FC<GoalLightProps> = ({ on }): JSX.Element => {
  const [hueSettings, setHueSettings] = React.useState(undefined);
  const [teamSettings, setTeamSettings] = React.useState(true);
  React.useEffect(() => {
    if (window.electron.store.get('hueSettings')) {
      setHueSettings(window.electron.store.get('hueSettings'));
    }
  }, [])

  return (
    <>
      {
        (hueSettings && teamSettings) &&
          <div css={css`
          box-sizing: border-box;
          position: relative;
          margin: 50px auto;
          width: 200px;
          height: 200px;

          transform-origin: 50% 50%;
          transform-style: preserve-3d;
          /* This is important! for z-axis effects */
          perspective: 120px;
        `}>
          <div css={css`
            display: block;
            position: absolute;
            height: 30px;
            width: 50px;
            bottom:45px;
            left: 50%;
            background: rgb(110,80,80);
            box-shadow: inset 5px 0 10px rgba(0,0,0,.5),  inset -5px 0 10px rgba(255,255,255,.3);
            border-radius: 50% 50% 50% 50% / 50% 50% 20% 20%;
            transform: translate(-50%,-50%);
          `} />
          <div css={css`
            position: absolute;
            left: 50%;
            top: 50%;
            height: 60px;
            width: 40px;
            background: rgb(255,0,0);
            border-radius: 20px 20px 50% 50% / 20px 20px 15% 15%;
            transform: translate(-50%,-50%);
            overflow: hidden;
            animation: 2s glow linear infinite;
          `}>
            <div css={css`
              position: absolute;
              width: 4px;
              height: 4px;
              top:28px;
              left:18px;
              background: rgba(255,50,50,1);
              box-shadow: 0 0 3px 15px rgba(200,200,100,.2);
              border-radius: 50%;
              z-index: 1;
              animation: 2s rotate3 linear infinite, 2s flash linear infinite;
              backface-visibility: hidden;
            `} />
            <div css={css`
              position: absolute;
              left:0;
              top:0;
              height: 60px;
              width: 40px;
              background: #000;
              border-radius: 20px 20px 50% 50% / 20px 20px 15% 15%;
              animation: 2s rotate3 linear infinite;
            `} />
            <div css={css`
              position: absolute;
              left:0;
              top:0;
              height: 60px;
              width: 40px;
              background: rgba(255,0,0,.5);
              box-shadow: inset 5px 3px 15px rgba(0,0,0,.5),  inset -5px 3px 15px rgba(255,255,255,.3);
            `} />
          </div>
          <div css={css`
            position: absolute;
            width: 1px;
            height: 1px;
            border-radius: 50%;
            left: 50%;
            top: 50%;
            transform-style: preserve-3d;
            transform-origin: center center;
            transform: translate(-50%, -50%);
            animation: 2s rotate linear infinite;
            box-shadow: 0 0 10px 10px rgba(255,255,255,0.3), 0 0 20px 15px rgba(200,0,0,0.6);
          `}/>
          <div css={css`
            position: absolute;
            right: 0%;
            top: 50%;
            width: 100px;
            height: 50px;
            border-left: 0px solid transparent;
            border-top: 25px solid transparent;
            border-right: 100px solid red;
            border-bottom: 25px solid transparent;
            transform-origin: center left;
            opacity: .1;
            transform: translate(0%,-50%);
            animation: 2s rotate2 linear infinite;
            filter: blur(4px);
          `} />
        </div>
      }
    </>
  );
};
