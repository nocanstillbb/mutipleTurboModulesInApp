import { createTheme, ThemeProvider } from '@rneui/themed';
import { components } from './components';

const theme = createTheme({
  ...components,

  lightColors: {
    primary: 'red',
  },
  darkColors: {
    primary: 'blue',
  },
});

export default function AppThemeProvider({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
