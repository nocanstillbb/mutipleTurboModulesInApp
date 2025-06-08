import { createTheme } from '@rneui/themed';

export const components = createTheme({
  components: {
    Button: {
      containerStyle: { marginTop: 10 },
      titleStyle: { fontWeight: 'bold' },
    }
  }
});

