"use client";

import { Label, TextInput, Tooltip } from "flowbite-react";
import React, { useContext, useEffect, useState, createRef, Suspense } from "react";
import { generateOtp, login, validateAccessToken } from "@/api/ticketingApis";
import { alertContext } from "@/hooks/alertContext";
import { useRouter, useSearchParams } from "next/navigation";
import { checkPhoneFormat } from "@/common/functions";
import ReCAPTCHA from "react-google-recaptcha";
import { AiFillLock } from "react-icons/ai";

function LoginView() {
  const [phone_number, setPhone] = useState("");
  const [show, setShow] = useState(false);
  const [token, setToken] = useState("");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState(false);

  // ✅ fixed: use the correct function name from context
  const { setAlertCtx } = useContext(alertContext);

  const router = useRouter();
  const searchParams = useSearchParams();
  const recaptchaRef = createRef();
  const jwtToken = searchParams.get("q");

  // --- Redirect if token exists ---
  useEffect(() => {
    if (jwtToken) {
      validateAccessToken(jwtToken)
        .then(() => {
          localStorage.setItem("jwt_token", jwtToken);
          router.push("/tickets");
        })
        .catch(() => { });
    } else if (localStorage.getItem("jwt_token")) {
      router.push("/tickets");
    }
  }, [jwtToken, router]);

  // --- OTP + Login logic ---
  const onSubmitWithReCAPTCHA = async () => {
    if (!recaptchaRef.current) return;

    const captchaToken = await recaptchaRef.current.executeAsync();
    if (!captchaToken) {
      setAlertCtx({
        title: "Error",
        message: "Please complete the CAPTCHA challenge",
        type: "error",
      });
      return;
    }

    setToken(captchaToken);
    setShow(true);
    getOtp(captchaToken);
  };

  const handleOnClick = () => {
    if (show) userLogin();
    else onSubmitWithReCAPTCHA();
  };

  const userLogin = () => {
    login({ brilliant_number: "88" + phone_number, otp, token })
      .then((res) => {
        setAlertCtx({
          title: "Success",
          message: "Login successful!",
          type: "success",
        });
        localStorage.setItem("jwt_token", res.data.auth_token);
        router.push("/tickets");
      })
      .catch((err) => {
        setOtp("");
        setShow(false);
        setPhone("");
        setAlertCtx({
          title: "Error",
          message:
            err?.response?.data?.message ||
            "Sorry, something went wrong. Please try again or refresh.",
          type: "error",
        });
      });
  };

  const getOtp = () => {
    generateOtp({ brilliant_number: "88" + phone_number })
      .then(() => {
        setOtpError(false);
        setAlertCtx({
          title: "OTP Sent",
          message: "An OTP has been sent to your Brilliant number.",
          type: "success",
        });
      })
      .catch((err) => {
        setOtpError(true);
        setOtp("");
        setAlertCtx({
          title: "Error",
          message:
            err?.response?.data?.message ||
            "Sorry, something went wrong. Please try again or refresh.",
          type: "error",
        });
      });
  };

  const disable = () => (show ? !!otp : checkPhoneFormat("88" + phone_number));

  // --- UI ---
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 relative">
      {/* Floating ReCAPTCHA (bottom-right) */}
      <div className="fixed bottom-2 right-2 z-50">
        <ReCAPTCHA
          ref={recaptchaRef}
          size="invisible"
          badge="bottomright"
          sitekey="6LcaZ1YsAAAAADpkzqa5SsWZZlhSaY7HqZi1iaXQ"
        />
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl px-8 py-10 flex flex-col items-center">
        {/* Logo */}
        <img
          src="https://s3.brilliant.com.bd/ticketing-connect/output-onlinepngtools.png"
          alt="Brilliant Connect"
          className="h-14 mb-4"
        />

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Brilliant Connect Ticketing
        </h2>

     <form
  className="w-full flex flex-col"
  onSubmit={(e) => {
    e.preventDefault(); // prevent page reload
    handleOnClick();    // trigger OTP or login logic
  }}
>
  {/* Phone Field */}
  <div className="w-full mb-4">
    <Label htmlFor="phoneNo" value="Brilliant Number" className="text-gray-700" />
    <TextInput
      id="phoneNo"
      type="text"
      required
      addon="+88"
      placeholder="e.g: 09638XXXXXX"
      value={phone_number}
      onChange={(e) => {
        setPhone(e.target.value);
        setShow(false);
      }}
      className="mt-1"
    />
  </div>

  {/* OTP Field */}
  {show && (
    <div className="w-full mb-4">
      <Label htmlFor="otp" value="Enter OTP" className="text-gray-700" />
      <TextInput
        id="otp"
        addon={<AiFillLock />}
        required
        placeholder="Enter your OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        className="mt-1"
      />
    </div>
  )}

  {/* Button */}
  <button
    type="submit" // <-- important change here
    disabled={!disable()}
    className={`w-full py-2.5 mt-2 rounded-lg font-medium text-white transition-all duration-200
      ${disable() ? "bg-blue-700 hover:bg-blue-800" : "bg-gray-400 cursor-not-allowed"}`}
      style={{cursor: "pointer"}}
  >
    {!show ? "Get OTP" : "Login"}
  </button>
</form>


        {/* Footer */}
        <p className="text-xs text-gray-500 mt-8 text-center">
          © {new Date().getFullYear()} Brilliant Connect. All rights reserved.
        </p>
      </div>
    </div>
  );
}

// Wrap in Suspense to fix useSearchParams() build error
export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
        <div className="text-gray-600">Loading...</div>
      </div>
    }>
      <LoginView />
    </Suspense>
  );
}
