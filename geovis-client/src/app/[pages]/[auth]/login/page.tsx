"use client";

import { EyeFilledIcon } from "@/components/EyeFilledIcon";
import { EyeSlashFilledIcon } from "@/components/EyeSlashFilledIcon";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function Login() {
  const [isVisible, setIsVisible] = React.useState(false);

  const toggleVisibility = () => setIsVisible(!isVisible);
  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div className="flex flex-col items-center justify-center">
        <p className="text-4xl text-center justify-self-start mb-10">
          GeoVis 💛
        </p>
        <p className="text-lg text-center font-bold mb-3">Login</p>
        <Input
          label="Email"
          labelPlacement="inside"
          variant="bordered"
          className="w-[300px] mb-3 outline-white hover:outline-[#ECCF2C]"
        />
        <Input
          label="Password"
          variant="bordered"
          placeholder="Enter your password"
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
        <Button className="bg-[#ECCF2C] text-black rounded-full px-6 mt-5">
          Submit
        </Button>

        <div className="flex mt-5 text-black">
          Have an account?&nbsp;
          <Link href={"/auth/signup"} className="text-[#ECCF2C] font-bold">
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
