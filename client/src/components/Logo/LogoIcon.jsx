import { SvgIcon } from "@mui/material";
import React from "react";
import { ReactComponent as LogoSVG } from "../../assets/logo.svg";

const LogoIcon = (props) => {
  return <SvgIcon {...props} component={LogoSVG} />;
};

export default LogoIcon;
