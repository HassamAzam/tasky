"use client";
import React, { useRef, useState } from "react";

import {
  TextField,
  Button,
  Paper,
  Typography,
  Box,
  Grid,
  CircularProgress,
} from "@mui/material";

import { authenticateUser } from "@/middleware/middleware";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from "next/navigation";
import Link from "next/link";
import useDocumentTitle from "@/app/titleHook";

interface IFormInput {
  email: string | undefined;
  password: string | undefined;
}

const LoginPage = () => {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<IFormInput>({ email: "", password: "" });

  useDocumentTitle("Login");

  const validateForm = () => {
    let valid = true;
    const newErrors = { email: "", password: "" };

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

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (validateForm()) {
      const email = emailRef.current?.value;
      const password = passwordRef.current?.value;
      setIsLoading(true);
      const user = await authenticateUser({ email, password });

      if (user == undefined || user == null || user == "") {
        setIsLoading(false);
        toast.error("Username of password wrong");
        
      } else {
        sessionStorage.setItem("loggedInUser", user);
        router.push("/board");
      }
    }
  };

  return (
    <>
      {isLoading && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            mt: "25%",
          }}
        >
          <CircularProgress />
        </Box>
      )}

      {!isLoading && (
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "linear-gradient(135deg, #000000 40%, #2575fc 100%)",
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
              Welcome Back
            </Typography>

            <Typography
              variant="subtitle1"
              align="center"
              sx={{ color: "#666", marginBottom: 3 }}
            >
              Please login to your account
            </Typography>

            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Email"
                    name="email"
                    variant="outlined"
                    fullWidth
                    inputRef={emailRef}
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
                    name="password"
                    type="password"
                    variant="outlined"
                    fullWidth
                    inputRef={passwordRef}
                    error={!!errors.password}
                    helperText={errors.password}
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
                  backgroundColor: "#2575fc",
                  "&:hover": {
                    backgroundColor: "#1a5ac7",
                  },
                  fontWeight: "bold",
                  boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)",
                }}
              >
                Login
              </Button>
            </form>

            <Typography
              variant="body2"
              align="center"
              sx={{ marginTop: 3, color: "#888" }}
            >
     
              <Button
                sx={{
                  color: "#2575fc",
                  textTransform: "none",
                  fontWeight: "bold",
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
              >
                <Link href="/signup">Sign up here</Link>
              </Button>
            </Typography>
          </Paper>
        </Box>
      )}
      <ToastContainer/>
    </>
  );
};

export default LoginPage;
