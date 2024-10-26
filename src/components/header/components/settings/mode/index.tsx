import styles from './index.module.scss';
import {
  Box,
  ToggleButton,
  ToggleButtonGroup,
  useColorScheme,
} from '@mui/material';
import { DefaultColorScheme } from '@mui/material/styles/createThemeWithVars';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import BrightnessAutoIcon from '@mui/icons-material/BrightnessAuto';

export default function Mode() {
  const { mode, setMode } = useColorScheme();

  const handleSetMode = (
    event: React.MouseEvent,
    newMode: DefaultColorScheme | null
  ) => {
    setMode(newMode);
  };

  return (
    <>
      <Box sx={{ mt: 2, mb: 1 }}>MODE</Box>
      <ToggleButtonGroup value={mode} exclusive onChange={handleSetMode}>
        <ToggleButton value="light">
          <WbSunnyIcon fontSize="small" className={styles.icon} />
          Light
        </ToggleButton>
        <ToggleButton value="system">
          <BrightnessAutoIcon fontSize="small" className={styles.icon} />
          System
        </ToggleButton>
        <ToggleButton value="dark">
          <DarkModeIcon fontSize="small" className={styles.icon} />
          Dark
        </ToggleButton>
      </ToggleButtonGroup>
    </>
  );
}
