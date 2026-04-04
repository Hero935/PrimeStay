import { v2 as cloudinary } from "cloudinary";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

/**
 * Cloudinary 簽名生成 API (用於 Signed Upload)
 * @param req 請求物件
 * @returns 簽名结果或是錯誤資訊
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "未登入" }, { status: 401 });
    }

    const body = await req.json();
    const { paramsToSign } = body;

    // 確保環境變數存在
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!apiSecret) {
      console.error("缺少 CLOUDINARY_API_SECRET 環境變數");
      return NextResponse.json({ error: "伺服器配置錯誤" }, { status: 500 });
    }

    // 使用 Cloudinary SDK 生成簽名
    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      apiSecret
    );

    return NextResponse.json({ signature });
  } catch (error) {
    console.error("Cloudinary 簽名生成失敗:", error);
    return NextResponse.json({ error: "系統錯誤" }, { status: 500 });
  }
}