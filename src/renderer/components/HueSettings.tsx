/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  FormHelperText,
  LinearProgress,
  Grid,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Slide,
} from '@mui/material';
import { useForm, DeepMap, FieldError } from 'react-hook-form';
import * as yup from 'yup';
import { SchemaOf } from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import { LoadingButton } from '@mui/lab';
import * as React from 'react';
import { AlertContext } from 'renderer/contexts/AlertContext';
import Settings from '@mui/icons-material/Settings';
import { Hue, HueBridge, HueLight, HueSettingsStore } from '../types';
import hue from '../../../assets/hue.png';

/*
  Todo:
  Add "Test settings" button
  Add "reset settings" button
*/

interface HueSettingsProps {
  triggerUpdate: () => void;
}

const HueSettings: React.FC<HueSettingsProps> = ({triggerUpdate}): JSX.Element => {
  const alertContext = React.useContext(AlertContext);
  const [open, setOpen] = React.useState(false);
  const [retrievingUser, setRetrievingUser] = React.useState(false);
  const [availableBridges, setAvailableBridges] = React.useState<HueBridge[] | undefined>();
  const [availableLights, setAvailableLights] = React.useState<HueLight[] | undefined>();
  const [selectedBridge, setSelectedBridge] = React.useState<HueBridge | undefined>(undefined);
  const [selectedLight, setSelectedLight] = React.useState<HueLight | undefined>(undefined);
  const [retrievingBridges, setRetrievingBridges] = React.useState<boolean>(false);
  const [retrievingLights, setRetrievingLights] = React.useState<boolean>(false);
  const [hueSettings, setHueSettings] = React.useState<HueSettingsStore | undefined>(undefined);

  React.useEffect(() => {
    const settings = window.electron.store.get('hueSettings')
    setHueSettings(settings);
    // window.electron.hueApi.getPassword(settings.username).then(password => {
      // console.log(password);
    // });
  }, []);

  React.useEffect(() => {
    if (selectedBridge) {
      setOpen(true);
    }
  }, [selectedBridge, availableBridges]);

  const handleClose = () => {
    setOpen(false);
  };

  const getBridges = async () => {
    setRetrievingBridges(true);
    const bridges: HueBridge[] = await window.electron.hueApi.getBridges();
    setAvailableBridges(bridges);
    setRetrievingBridges(false);
  };

  const getLights = async () => {
    setRetrievingLights(true);
    const lights = await window.electron.hueApi.getLights();
    setAvailableLights(lights);
    setRetrievingLights(false);
  }

  const handleBridgeSelect = (e: any, v: any) => {
    setSelectedBridge(
      availableBridges?.find((bridge) => bridge.name === v.props.value)
    );
  };

  const handleLightSelect = (e: any, v: any) => {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const selectedLight = availableLights?.find((light) => light.data.name === v.props.value)
    if (!selectedLight?.data.type.toLowerCase().includes("color")) {
      alertContext.setMessage("The light you have selected does not support color. When activated, the light will flash on and off.")
      alertContext.setIsOpen(true);
    }
    setSelectedLight(selectedLight);
    window.electron.store.set('hueSettings.light', selectedLight);
    triggerUpdate();
  };

  const createUser = async () => {
    setRetrievingUser(true);
    if (selectedBridge) {
      const username = await window.electron.hueApi.createUser(selectedBridge.ipaddress)
      if (username) {
        window.electron.store.set('hueSettings.username', username);
        window.electron.store.set('hueSettings.bridgeIpAddress', selectedBridge.ipaddress);
      }
      setRetrievingUser(false);
      triggerUpdate();
    }
  }

  const resetLight = () => {
    window.electron.store.set('hueSettings.light', null);
    const settings = window.electron.store.get('hueSettings')
    setHueSettings(settings);
    triggerUpdate();
  }

  window.electron.hueApi.onError((_event: Electron.IpcMainEvent, err: { message: string; }) => {
    alertContext.setVariant("error");
    alertContext.setMessage(`Error: ${err.message}`);
    alertContext.setIsOpen(true);
  })

  return (
    <>
      {/* Hue Bridge Selection */}
      {!hueSettings?.bridgeIpAddress ?
        <FormControl variant="standard" disabled={!availableBridges} fullWidth>
          {availableBridges &&
            <>
              <InputLabel id="bridge-select-label">Select Bridge</InputLabel>
              <Select
                labelId="bridge-select-label"
                id="bridge-select"
                value={selectedBridge?.name || ''}
                label="Select Team"
                onChange={handleBridgeSelect}
                css={css`
                  flex-grow: 1;
                `}
              >
                {availableBridges ? (
                  availableBridges.map((bridge) => (
                    <MenuItem value={bridge.name} key={bridge.name}>{bridge.name}</MenuItem>
                  ))
                ) : (
                  <MenuItem disabled value="">
                    None
                  </MenuItem>
                )}
              </Select>
            </>
          }
          {!availableBridges && (
            <LoadingButton
              loading={retrievingBridges}
              onClick={() => getBridges()}
              variant="contained"
              size="large"
            >
              Search for Bridges
            </LoadingButton>
          )}
        </FormControl>
      :
        <>
          <div>Hue Bridge IP Address: {hueSettings?.bridgeIpAddress}</div>
        </>
      }
      {/* Hue Account Creation */}
      {(selectedBridge && !hueSettings?.username) ? (
        <>
          <p>To continue, press the &quot;Ready&quot; button below.</p>
          <p>
            Woohue will attempt to connect to your bridge and create a user
            account to communicate with the associated lights and groups.
          </p>
          <LoadingButton
            size="large"
            variant="contained"
            onClick={() => createUser()}
            loading={retrievingUser}
            endIcon={<TouchAppIcon />}
          >
            Ready
          </LoadingButton>
        </>
      )
        :
        <div>Hue Account Status: {hueSettings?.username ? <span style={{color: 'lightgreen'}}>Ok</span> : <span style={{color: 'red'}}>Not found</span>}</div>
      }
      {/* Hue Light Selection */}
      {
        (hueSettings?.bridgeIpAddress && hueSettings.username && !hueSettings.light) ?
        <FormControl variant="standard" disabled={!availableLights} fullWidth sx={{marginTop: '15px'}}>
          {availableLights &&
            <>
              <InputLabel id="light-select-label">Select Light</InputLabel>
              <Select
                labelId="light-select-label"
                id="light-select"
                value={selectedLight?.data.name || ''}
                label="Select Team"
                onChange={handleLightSelect}
                css={css`
                  flex-grow: 1;
                `}
              >
                {availableLights ? (
                  availableLights.map((light) => (
                    <MenuItem value={light.data.name} key={light.data.id}>{light.data.name}</MenuItem>
                  ))
                ) : (
                  <MenuItem disabled value="">
                    None
                  </MenuItem>
                )}
              </Select>
            </>
          }
          {!availableLights && (
            <LoadingButton
              loading={retrievingLights}
              onClick={() => getLights()}
              variant="contained"
              size="large"
            >
              Search for Available Lights
            </LoadingButton>
          )}
        </FormControl>
        :
        <>
          <div>Selected Light: {hueSettings?.light?.data.name} <Button onClick={resetLight}>Reset Light</Button> </div>
        </>
      }
      <Dialog
        open={open}
        keepMounted
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>Please read!</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            Before proceeding, please press the button on the top of your
            Philips Hue bridge. <br/>After doing so, press the &quot;Ready&quot;
            button to continue. <br/><b>Note: You will only have 30 seconds to proceed after pushing the link button.</b>
          </DialogContentText>
          <div
            css={css`
              display: flex;
              justify-content: center;
            `}
          >
            <img src={hue} alt="Philips Hue Bridge" />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Ok</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default HueSettings;
