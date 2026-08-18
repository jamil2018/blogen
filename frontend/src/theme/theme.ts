import { adaptV4Theme, createTheme } from "@mui/material/styles";
import { grey, orange } from "@mui/material/colors";

const theme = createTheme(
  adaptV4Theme({
    palette: {
      background: {
        default: "#ffffff",
      },
      primary: {
        light: orange["600"],
        main: orange["800"],
        dark: orange["900"],
        contrastText: grey["50"],
      },
      secondary: {
        light: grey["500"],
        main: grey["600"],
        dark: grey["700"],
        contrastText: grey["50"],
      },
      text: {
        primary: grey["700"],
        secondary: grey["800"],
        disabled: grey["600"],
      },
    },
  })
);

export default theme;
