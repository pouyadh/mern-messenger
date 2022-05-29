import React from "react";
import { LinearProgress as MuiLinearProgress } from "@mui/material";

const LinearProgress = ({ sx, ...props }) => {
  return (
    <MuiLinearProgress
      sx={{ height: "10px", borderRadius: "10px", ...sx }}
      {...props}
    />
  );
};

export default LinearProgress;
