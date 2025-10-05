import React, { useEffect, useState } from 'react';
import { Alert, Snackbar } from '@mui/material';
import type { AlertColor, SnackbarOrigin } from '@mui/material';

type Props = {
  invalid: boolean;
  message: string;
  inlineId?: string; // hook up via aria-describedby on the field
  showInline?: boolean; // also render inline <p> error
  severity?: AlertColor; // defaults to 'error'
  duration?: number; // ms, defaults to 4000
  anchorOrigin?: SnackbarOrigin; // defaults bottom/center
  onClose?: () => void;
};

export function Notice({
  invalid,
  message,
  inlineId,
  showInline = false,
  severity = 'error',
  duration = 4000,
  anchorOrigin = { vertical: 'bottom', horizontal: 'right' },
  onClose,
}: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(invalid);
  }, [invalid]);

  const handleClose = (_: unknown, reason?: 'timeout' | 'clickaway' | 'escapeKeyDown') => {
    if (reason === 'clickaway') return;
    setOpen(false);
    onClose?.();
  };

  return (
    <>
      <Snackbar
        open={open}
        autoHideDuration={duration}
        onClose={handleClose}
        anchorOrigin={anchorOrigin}
      >
        <Alert onClose={handleClose} severity={severity} variant="filled" sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>

      {showInline && invalid && (
        <p id={inlineId} className="dmn-widget__error" role="alert" aria-live="polite">
          {message}
        </p>
      )}
    </>
  );
}
