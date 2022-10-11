import * as React from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { AlertContext } from "renderer/contexts/AlertContext";
import { getByTitle } from "@testing-library/react";

const Alert: React.FC = (): JSX.Element => {
  const { variant, message, isOpen, setIsOpen } = React.useContext(AlertContext);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <Dialog
      open={isOpen}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {message && message}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} autoFocus>Ok</Button>
      </DialogActions>
    </Dialog>
  )
};

export default Alert;
