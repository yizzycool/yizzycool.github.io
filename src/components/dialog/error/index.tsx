import { Alert, AlertTitle, Dialog } from '@mui/material';

type Props = {
  errorString: string;
  open: boolean;
  onClose: Function;
};

export default function ErrorDialog({
  errorString,
  open,
  onClose = () => {},
}: Props) {
  const onDialogClose = () => onClose();
  const onAlertClose = () => onClose();

  return (
    <Dialog open={open} onClose={onDialogClose}>
      <Alert variant="standard" severity="error" onClose={onAlertClose}>
        <AlertTitle>Error</AlertTitle>
        {errorString}
      </Alert>
    </Dialog>
  );
}
