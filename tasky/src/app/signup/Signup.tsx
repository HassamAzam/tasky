"use client";

import React, { useRef } from "react";
import { TextField, Button, Paper, Typography, Box, Grid } from "@mui/material";
import Link from "next/link";

import { insertUser } from "@/middleware/middleware";
import useDocumentTitle from "../titleHook";

const SignupPage = () => {
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = React.useState<{ [key: string]: string }>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useDocumentTitle("SignUp")
  const validateForm = () => {
    let valid = true;
    const newErrors = {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    };

    if (!nameRef.current?.value) {
      newErrors.name = "Name is required";
      valid = false;
    }

    if (!emailRef.current?.value) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (
      !/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(
        emailRef.current.value
      )
    ) {
      newErrors.email = "Invalid email address";
      valid = false;
    }

    if (!passwordRef.current?.value) {
      newErrors.password = "Password is required";
      valid = false;
    } else if (passwordRef.current.value.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
      valid = false;
    }

    if (confirmPasswordRef.current?.value !== passwordRef.current?.value) {
      newErrors.confirmPassword = "Passwords do not match";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (validateForm()) {
      const name = nameRef.current?.value;
      const email = emailRef.current?.value;
      const password = passwordRef.current?.value;

      await insertUser({ name, email, password });
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #000000 30%, #17d5ec 100%)",
        padding: 2,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          padding: 5,
          width: "100%",
          maxWidth: 420,
          backgroundColor: "#ffffff",
          borderRadius: 3,
          boxShadow: "0 12px 24px rgba(0, 0, 0, 0.2)",
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          align="center"
          sx={{ color: "#333", fontWeight: "bold" }}
        >
          Create an Account
        </Typography>

        <Typography
          variant="subtitle1"
          align="center"
          sx={{ color: "#666", marginBottom: 3 }}
        >
          Sign up to get started
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Name"
                inputRef={nameRef}
                variant="outlined"
                fullWidth
                error={!!errors.name}
                helperText={errors.name}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Email"
                inputRef={emailRef}
                variant="outlined"
                fullWidth
                error={!!errors.email}
                helperText={errors.email}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Password"
                inputRef={passwordRef}
                type="password"
                variant="outlined"
                fullWidth
                error={!!errors.password}
                helperText={errors.password}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Confirm Password"
                inputRef={confirmPasswordRef}
                type="password"
                variant="outlined"
                fullWidth
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>
          </Grid>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{
              marginTop: 3,
              padding: 1.5,
              borderRadius: 2,
              backgroundColor: "rgb(37, 150, 190)",
              "&:hover": {
                backgroundColor: "#8ce1ec",
              },
              fontWeight: "bold",
              boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)",
            }}
          >
            Sign Up
          </Button>
        </form>

        <Typography
          variant="body2"
          align="center"
          sx={{ marginTop: 3, color: "#888" }}
        >
          Already have an account?{" "}
          <Button
            sx={{
              color: "#16bdd2",
              textTransform: "none",
              fontWeight: "bold",
              "&:hover": {
                textDecoration: "underline",
              },
            }}
          >
            <Link href="/login">Login here</Link>
          </Button>
        </Typography>
      </Paper>
    </Box>
  );
};

export default SignupPage;
