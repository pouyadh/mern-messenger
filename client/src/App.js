import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import Loading from "./pages/Loading";
import Signup from "./pages/Signup";
import Signin from "./pages/Signin";

const theme = createTheme({
  palette: {
    mode: "light",
    background: {
      default: "#f2f2f2",
    },
  },
  typography: {
    fontFamily: '"Nunito" , sans-serif',
    fontWeightLight: 400,
    fontWeightRegular: 500,
    fontWeightMedium: 600,
    fontWeightBold: 800,
  },
});

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Routes>
          <Route path="/loading" element={<Loading />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/signin" element={<Signin />} />
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
