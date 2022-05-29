import { Container, Typography } from "@mui/material";
import React from "react";
import LinearProgress from "../../components/Progress/LinearProgress";
import LogoIcon from "../../components/Logo/LogoIcon";
import LogoText from "../../components/Logo/LogoText";

const styles = {
  container: {
    textAlign: "center",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
};

const appVersion = process.env.REACT_APP_VERSION;

const Loading = () => {
  return (
    <Container disableGutters sx={styles.container}>
      <LogoIcon sx={{ fontSize: "128px", mb: 4 }} />
      <LogoText height="50px" />
      <LinearProgress sx={{ width: "96px", mt: 10 }} />
      <Typography variant="subtitle2" color="grey.600" sx={{ mt: 4 }}>
        V{appVersion}
      </Typography>
    </Container>
  );
};

export default Loading;
