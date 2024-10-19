"use client";

import { EyeFilledIcon } from "@/components/EyeFilledIcon";
import { EyeSlashFilledIcon } from "@/components/EyeSlashFilledIcon";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { signIn } from 'next-auth/react';
import { validateEmail, validatePassword, handleAuthAction } from "@/lib/auth_utils";

export default function Signup() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(formData.email)) {
      setError('Invalid email format');
      return;
    }

    if (!validatePassword(formData.password)) {
      setError('Password must be at least 5 characters long');
      return;
    }

    handleAuthAction(
      'register',
      formData,
      () => {
        alert('User created successfully!');
        router.push("/login");
      },
      setError
    );
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div className="flex flex-col items-center justify-center">
        <p className="text-4xl text-center justify-self-start mb-10">GeoVis 💛</p>
        <p className="text-lg text-center font-bold mb-3">Signup</p>

        {error && <p className="text-red-500 mb-3">{error}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col items-center">
          <Input
            name="name"
            label="Name"
            labelPlacement="inside"
            variant="bordered"
            className="w-[300px] mb-3 outline-white hover:outline-[#ECCF2C]"
            value={formData.name}
            onChange={handleInputChange}
          />
          <Input
            name="email"
            label="Email"
            labelPlacement="inside"
            variant="bordered"
            className="w-[300px] mb-3 outline-white hover:outline-[#ECCF2C]"
            value={formData.email}
            onChange={handleInputChange}
          />
          <Input
            name="password"
            label="Password"
            labelPlacement="inside"
            variant="bordered"
            className="w-[300px] mb-3"
            type={isVisible ? "text" : "password"}
            value={formData.password}
            onChange={handleInputChange}
            endContent={
              <button
                className="focus:outline-none"
                type="button"
                onClick={() => setIsVisible(!isVisible)}
              >
                {isVisible ? <EyeFilledIcon /> : <EyeSlashFilledIcon />}
              </button>
            }
          />
          <Button
            type="submit"
            className="bg-[#ECCF2C] text-black rounded-full px-6 mt-5"
          >
            Submit
          </Button>
        </form>

        <div className="flex mt-5 text-black">
          Have an account?&nbsp;
          <Link href="/login" className="text-[#ECCF2C] font-bold">
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
