"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button, Input } from "@nextui-org/react";
import { EyeFilledIcon } from "@/components/EyeFilledIcon";
import { EyeSlashFilledIcon } from "@/components/EyeSlashFilledIcon";
import { validateEmail, validatePassword, handleAuthAction } from "@/lib/auth_utils";
import IndicationModal from "@/components/Modal";

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleModalAction = () => {
    setIsModalOpen(false); // Close the modal
    router.push("/"); // Redirect after the modal action
  };

  const toggleVisibility = () => setIsVisible(!isVisible);

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

    await handleAuthAction(
      'login',
      formData,
      () => {
        setIsModalOpen(true);
      },
      setError
    );
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div className="h-screen lg:h-auto flex flex-col items-center justify-start lg:justify-center">
      <div className="lg:hidden">
        <Image
          src="/assets/street-map.png"
          alt="Street Map Cover Image"
          width={0}
          height={0}
          sizes="100vw"
          style={{ width: "auto", height: "400px", objectFit: "cover" }}
        />
      </div>
        <p className="text-4xl text-center justify-self-start mb-10 mt-10">GeoVis 💛</p>
        <p className="text-lg text-center font-bold mb-3">Login</p>

        {error && <p className="text-red-500 mb-3">{error}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col items-center">
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
                onClick={toggleVisibility}
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
          Don't have an account?&nbsp;
          <Link href="/signup" className="text-[#ECCF2C] font-bold">
            Signup
          </Link>
        </div>
      </div>
      <div className="hidden lg:flex h-screen">
        <Image
          src="/assets/street-map.png"
          alt="Street Map Cover Image"
          width={0}
          height={0}
          sizes="100vw"
          style={{ width: "100%", height: "100vh", objectFit: "cover" }}
        />
      </div>
      <IndicationModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        title="Success!"
        content={["You have successfully logged in."]}
        primaryActionLabel="Continue"
        onPrimaryAction={handleModalAction}
      />
    </div>
  );
}
