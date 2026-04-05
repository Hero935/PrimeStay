"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * 註冊組件 (包裝在 Suspense 內以支援 useSearchParams)
 */
function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [code, setCode] = useState(searchParams.get("code") || "");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [invitationInfo, setInvitationInfo] = useState<any>(null);
  const [orgName, setOrgName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // 1. 如果有 Code，自動驗證邀請碼資訊
  useEffect(() => {
    if (code && code.length >= 8) {
      verifyCode(code);
    }
  }, []);

  const verifyCode = async (invitationCode: string) => {
    setVerifying(true);
    setError("");
    try {
      const res = await fetch(`/api/invitations/verify/${invitationCode}`);
      const data = await res.json();
      if (res.ok) {
        setInvitationInfo(data);
      } else {
        setError(data.error || "邀請碼驗證失敗");
        setInvitationInfo(null);
      }
    } catch (err) {
      setError("無法連線至驗證伺服器");
    } finally {
      setVerifying(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          name,
          code,
          organizationName: orgName
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("註冊成功！請登入系統");
        router.push("/login");
      } else {
        setError(data.error || "註冊失敗");
      }
    } catch (err) {
      setError("發生系統錯誤");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8 p-8 bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">加入 PrimeStay</h2>
          <p className="mt-2 text-sm text-gray-600">請憑邀請碼完成帳號註冊</p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleRegister}>
          <div>
            <label className="block text-sm font-medium text-gray-700">邀請碼</label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                className="block w-full rounded-md border border-gray-300 px-3 py-2 uppercase focus:border-primary focus:ring-primary sm:text-sm"
                placeholder="例如: ABC12345"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
              />
              <button
                type="button"
                onClick={() => verifyCode(code)}
                className="bg-gray-100 px-3 py-2 rounded text-xs hover:bg-gray-200 transition-colors"
                disabled={verifying}
              >
                {verifying ? "..." : "驗證"}
              </button>
            </div>
          </div>

          {invitationInfo && (
            <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
              <p className="text-xs text-blue-800 font-bold">邀請資訊：</p>
              <p className="text-xs text-blue-700">組織：{invitationInfo.organizationName}</p>
              {invitationInfo.propertyAddress && (
                <p className="text-xs text-blue-700">房源：{invitationInfo.propertyAddress}</p>
              )}
              <p className="text-xs text-blue-700">角色：{invitationInfo.role}</p>
            </div>
          )}

          {invitationInfo?.role === "LANDLORD" && !invitationInfo.organizationName && (
            <div>
              <label className="block text-sm font-medium text-gray-700">組織名稱 (由房東自定義)</label>
              <input
                type="text"
                required
                placeholder="自訂您的管理組織名稱"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary sm:text-sm bg-amber-50"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
              />
              <p className="mt-1 text-[10px] text-amber-600 font-medium">✨ 身為房東，您將為團隊建立一個新的組織。</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">姓名</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary sm:text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">電子信箱</label>
            <input
              type="email"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary sm:text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">設定密碼</label>
            <input
              type="password"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary sm:text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <div className="text-red-500 text-sm font-medium">{error}</div>}

          <button
            type="submit"
            disabled={loading || !invitationInfo}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-300"
          >
            {loading ? "註冊中..." : "建立帳號"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}