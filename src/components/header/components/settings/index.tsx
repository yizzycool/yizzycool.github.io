import styles from './index.module.scss';
import { useState } from 'react';
import { Box, Divider, Drawer, IconButton } from '@mui/material';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import CloseIcon from '@mui/icons-material/Close';
import Mode from './mode';

export default function Settings() {
  const [open, setOpen] = useState(false);

  const toggleDrawer = () => setOpen((prev) => !prev);

  return (
    <>
      <IconButton onClick={toggleDrawer}>
        <SettingsOutlinedIcon />
      </IconButton>
      <Drawer open={open} onClose={toggleDrawer} anchor="right">
        <Box sx={{ p: 2 }} className={styles.settingsTitle}>
          <div>Settings</div>
          <IconButton size="small" onClick={toggleDrawer}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        <Box sx={{ px: 2 }} className={styles.mode}>
          <Mode />
        </Box>
      </Drawer>
    </>
  );
}
