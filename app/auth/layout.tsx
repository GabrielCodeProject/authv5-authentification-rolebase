import React from "react";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <section className="w-full h-screen relative">
      <div className="absolute inset-0 h-full w-full bg-white bg-[linear-gradient(to right, #f0f0f0_1px,transparent_1px), linear-gradient(to bottom, #f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]">
        <div className="h-full flex items-center justify-center">
          {children}
        </div>
      </div>
    </section>
  );
};

export default AuthLayout;
