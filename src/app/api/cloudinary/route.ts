import { v2 as cloudinary } from "cloudinary";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

// 配置 Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Cloudinary 檔案管理 API
 * 目前支援 DELETE 操作來移除雲端圖片
 */
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "未登入" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const publicId = searchParams.get("publicId");

    if (!publicId) {
      return NextResponse.json({ error: "缺少 publicId" }, { status: 400 });
    }

    // 執行刪除操作
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === "ok" || result.result === "not found") {
      return NextResponse.json({ success: true, result: result.result });
    } else {
      console.error("Cloudinary 刪除失敗回傳:", result);
      return NextResponse.json({ error: "Cloudinary 刪除失敗", detail: result }, { status: 500 });
    }
  } catch (error) {
    console.error("Cloudinary 刪除 API 錯誤:", error);
    return NextResponse.json({ error: "系統錯誤" }, { status: 500 });
  }
}