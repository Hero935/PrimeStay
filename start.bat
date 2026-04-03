@echo off
echo [PrimeStay] 正在啟動開發環境...
echo [PrimeStay] 檢查環境變數...
if not exist .env (
    echo [ERROR] 找不到 .env 檔案，請參考 readme.md 進行設定。
    pause
    exit /b 1
)

echo [PrimeStay] 執行 Prisma 生成器...
call npx prisma generate

echo [PrimeStay] 正在啟動 Next.js 開發伺服器...
call npm run dev