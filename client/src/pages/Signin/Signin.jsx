import * as React from "react";
import LogoText from "../../components/Logo/LogoText";
import { Button, Container, Paper, Stack, Typography } from "@mui/material";
import { Field, Form, Formik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import Input from "../../components/Input/Input";
import LinearProgress from "../../components/Progress/LinearProgress";

const initialValues = {
  username: "",
  password: "",
};

const validationSchema = Yup.object({
  username: Yup.string()
    .min(4, "At least 4 character")
    .max(50, "Maximum 50 character")
    .required("Required"),
  password: Yup.string()
    .min(8, "At least 8 character")
    .max(50, "Maximum 50 character")
    .required("Required"),
});

const handleSubmit = async (values) => {
  console.log(values);
  await new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, 2000);
  });
};

const Signin = () => {
  const navigate = useNavigate();
  return (
    <Container maxWidth="xs" sx={{ pt: "auto" }}>
      <Paper
        sx={{
          textAlign: "center",
          padding: "auto",
          p: 4,
          mt: 4,
        }}
        elevation={10}
      >
        <Stack direction="column" spacing={2}>
          <LogoText height="24px" />
          <Formik
            initialValues={initialValues}
            onSubmit={handleSubmit}
            validationSchema={validationSchema}
          >
            {({ submitForm, isSubmitting }) => (
              <Form>
                <Stack direction="column" spacing={2}>
                  <Typography variant="h5" alignSelf="start">
                    {isSubmitting && <LinearProgress sx={{ height: "5px" }} />}
                    Signin
                  </Typography>
                  <Field
                    component={Input.Username}
                    type="text"
                    name="username"
                    label="Username"
                  />

                  <Field
                    component={Input.Password}
                    name="password"
                    label="Password"
                  />

                  <Button
                    variant="contained"
                    disabled={isSubmitting}
                    onClick={submitForm}
                  >
                    Signin
                  </Button>
                </Stack>
              </Form>
            )}
          </Formik>
          <Button variant="text" onClick={() => navigate("/signup")}>
            Signup
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
};

export default Signin;
