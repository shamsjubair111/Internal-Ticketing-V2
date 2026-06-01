"use client";
import { useContext, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { forgotPassword } from "@/api/tickets";
import { alertContext } from "@/hooks/alertContext";

function View() {
  const router = useRouter(); const { setAlertCtx } = useContext(alertContext);
  const [username, setUsername] = useState(""); const [password, setPassword] = useState(""); const [confirmPwd, setConfirmPwd] = useState(""); const [code, setCode] = useState(""); const [loading, setLoading] = useState(false);
  const I = "w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
  const handleReset = () => {
    if (password !== confirmPwd) { setAlertCtx({ title: "Error", message: "Passwords do not match.", type: "error" }); return; }
    setLoading(true);
    forgotPassword(username, password, code).then(() => { setAlertCtx({ title: "Success!", message: "Password reset. Please login.", type: "success" }); router.push("/"); }).catch(() => setAlertCtx({ title: "Failed!", message: "Invalid code or username.", type: "error" })).finally(() => setLoading(false));
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl px-8 py-10 flex flex-col items-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Reset Password</h2>
        <p className="text-sm text-gray-500 mb-6 text-center">Enter your username, verification code, and new password</p>
        <div className="w-full flex flex-col gap-3">
          <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value.trim())} className={I} />
          <input type="text" placeholder="Verification code (from email)" value={code} onChange={(e) => setCode(e.target.value.trim())} className={I} />
          <input type="password" placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value.trim())} className={I} />
          <input type="password" placeholder="Confirm new password" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value.trim())} className={I} />
          {password && confirmPwd && password !== confirmPwd && <p className="text-xs text-red-500">Passwords do not match</p>}
          <button onClick={handleReset} disabled={!username || !code || !password || !confirmPwd || loading} style={{ cursor: "pointer" }} className="w-full py-2.5 rounded-lg font-medium text-white bg-blue-700 hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all mt-2">
            {loading ? "Resetting..." : "Reset Password"}
          </button>
          <p className="text-center text-sm text-blue-700 cursor-pointer hover:underline" onClick={() => router.push("/")}>← Back to Sign In</p>
        </div>
      </div>
    </div>
  );
}
export default function ResetPasswordPage() { return <Suspense><View /></Suspense>; }
