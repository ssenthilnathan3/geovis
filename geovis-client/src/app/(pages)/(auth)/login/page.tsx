"use client";

import { EyeFilledIcon } from "@/components/EyeFilledIcon";
import { EyeSlashFilledIcon } from "@/components/EyeSlashFilledIcon";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/react";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const router = useRouter();
  const [isVisible, setIsVisible] = React.useState(false);

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();

    // Validate email before submitting
    if (!validateEmail(email)) {
      setEmailError('Invalid email format');
      return;
    }

    if (!validatePassword(password)) {
      setPasswordError('Invalid password format');
      return;
    }

    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError(res.error);
    } else {
      router.push('/protected'); // Redirect to a protected page
    }
  };

  // Email validation using regex
  const validateEmail = (email: string) => {
    const pattern = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    return pattern.test(email);
  };

  const validatePassword = (password: string) => {
    const pattern = /^.{5,}$/
    return pattern.test(password);
  }

  const toggleVisibility = () => setIsVisible(!isVisible);

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div className="flex flex-col items-center justify-center">
        <p className="text-4xl text-center justify-self-start mb-10">
          GeoVis 💛
        </p>
        <p className="text-lg text-center font-bold mb-3">Login</p>
        <form onSubmit={handleSubmit}>
          <Input
            label="Email"
            labelPlacement="inside"
            variant="bordered"
            className="w-[300px] mb-3 outline-white hover:outline-[#ECCF2C]"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError(''); // Clear error when typing
            }}
            errorMessage={emailError || error}
            isInvalid={!!emailError}
          />
          <Input
            label="Password"
            labelPlacement="inside"
            variant="bordered"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (passwordError) setPasswordError(''); // Clear error when typing
            }}
            errorMessage={passwordError || error}
            isInvalid={!!passwordError}
            endContent={
              <button
                className="focus:outline-none"
                type="button"
                onClick={toggleVisibility}
                aria-label="toggle password visibility"
              >
                {isVisible ? (
                  <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                ) : (
                  <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                )}
              </button>
            }
            type={isVisible ? "text" : "password"}
            className="w-[300px] mb-3"
          />
          <Button
            type="submit"
            className="bg-[#ECCF2C] text-black rounded-full px-6 mt-5"
            onSubmit={handleSubmit}
          >
            Submit
          </Button>
        </form>
        <div className="flex mt-5 text-black">
          Don't have an account?&nbsp;
          <Link href={"/login"} className="text-[#ECCF2C] font-bold">
            Login
          </Link>
        </div>
      </div>
      <div className="h-screen">
        <Image
          src="/assets/street-map.png"
          alt="Street Map Cover Image"
          width={0}
          height={0}
          sizes="100vw"
          style={{ width: "100%", height: "100vh", objectFit: "cover" }}
        />
      </div>
    </div>
  );
}
