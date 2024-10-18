"use client";

import { EyeFilledIcon } from "@/components/EyeFilledIcon";
import { EyeSlashFilledIcon } from "@/components/EyeSlashFilledIcon";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter()

  const toggleVisibility = () => setIsVisible(!isVisible);

  const validateEmail = (email: string) => {
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return pattern.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 5; // At least 5 characters
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate input fields
    if (!validateEmail(email)) {
      setError('Invalid email format');
      return;
    }

    if (!validatePassword(password)) {
      setError('Password must be at least 5 characters long');
      return;
    }

    setError('');

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, name }),
    });

    const data = await res.json();

    if (res.ok) {
      alert('User created successfully!');
      router.push("/login")
    } else {
      setError(data.message || 'Something went wrong');
    }
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div className="flex flex-col items-center justify-center">
        <p className="text-4xl text-center justify-self-start mb-10">GeoVis 💛</p>
        <p className="text-lg text-center font-bold mb-3">Signup</p>

        {error && <p className="text-red-500 mb-3">{error}</p>} {/* Display error message */}

        <Input
          label="Name"
          labelPlacement="inside"
          variant="bordered"
          className="w-[300px] mb-3 outline-white hover:outline-[#ECCF2C]"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          label="Email"
          labelPlacement="inside"
          variant="bordered"
          className="w-[300px] mb-3 outline-white hover:outline-[#ECCF2C]"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          label="Password"
          labelPlacement="inside"
          variant="bordered"
          className="w-[300px] mb-3"
          type={isVisible ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
        />
        <Button
          className="bg-[#ECCF2C] text-black rounded-full px-6 mt-5"
          onClick={handleSubmit}
        >
          Submit
        </Button>

        <div className="flex mt-5 text-black">
          Have an account?&nbsp;
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
