# 🗄️ 資料庫欄位設計文檔 (db_design.md)

根據「高端租屋代管平台」需求，以下為資料庫各資料表（Tables）詳細設計：

## 1. 📂 用戶與角色模組 (User & Auth)

### 👤 `User` (用戶表)
| 欄位名稱 | 型別 | 屬性 | 說明 | 關聯性 |
| :--- | :--- | :--- | :--- | :--- |
| `id` | UUID | PK | 唯一識別碼 | |
| `email` | String | Unique, Not Null | 電子郵件 (登入帳號) | |
| `hashedPassword` | String | Not Null | 加密後的密碼 | |
| `name` | String | | 用戶全名 | |
| `systemRole` | Enum | ADMIN, LANDLORD, MANAGER, TENANT | 全域系統角色 (預設 TENANT) | |
| `status` | Enum | ACTIVE, SUSPENDED | 帳號狀態 | |
| `createdAt` | DateTime | Default(now()) | 帳號建立時間 | |
| `updatedAt` | DateTime | UpdatedAt | 帳號更新時間 | |

---

## 2. 🏢 組織與多租戶模組 (Multi-Tenant)

### 🏢 `Organization` (組織表)
| 欄位名稱 | 型別 | 屬性 | 說明 | 關聯性 |
| :--- | :--- | :--- | :--- | :--- |
| `id` | UUID | PK | 組織唯一識別碼 | |
| `name` | String | Not Null | 組織名稱 (代管公司/房東工作室) | |
| `logoUrl` | String | | 組織 Logo | |
| `phone` | String | | 聯絡電話 | |
| `email` | String | | 聯絡 Email | |
| `ownerId` | UUID | FK | 擁有者 (Landlord ID) | User.id (1:N) |
| `plan` | Enum | FREE, STARTER, PRO | 訂閱方案 | |
| `planExpiresAt` | DateTime | | 方案到期日 | |
| `createdAt` | DateTime | Default(now()) | 建立時間 | |
| `updatedAt` | DateTime | UpdatedAt | 更新時間 | |

### 👥 `UserOrganization` (用戶與組織關聯表)
| 欄位名稱 | 型別 | 屬性 | 說明 | 關聯性 |
| :--- | :--- | :--- | :--- | :--- |
| `id` | UUID | PK, Default(uuid_generate_v4()) | | |
| `userId` | UUID | FK, Not Null | 用戶 ID | User.id |
| `organizationId` | UUID | FK, Not Null | 組織 ID | Organization.id |
| `memberRole` | Enum | OWNER, MANAGER | 在組織內的角色權限 | |

> **約束**：Unique(userId, organizationId)

---

## 3. 🏠 資產管理模組 (Property Management)

### 🏠 `Property` (房源/物業表)
房源主要記錄物件的實體資訊與預設租務設定。

| 欄位名稱 | 型別 | 屬性 | 說明 | 關聯性 |
| :--- | :--- | :--- | :--- | :--- |
| `id` | UUID | PK | 房源唯一識別碼 | |
| `organizationId` | UUID | FK, Not Null | 所屬組織 | Organization.id |
| `managerId` | UUID | FK | 責任管理員 | User.id |
| `address` | String | Not Null | **詳細地址** | |
| `roomNumber` | String | Not Null | **房號** | |
| `type` | String | Not Null | **類型** (如：獨立套房、分租套房、雅房) | |
| `size` | Decimal | Not Null | **坪數** | |
| `photos` | String[] | | 房源照片 URL 列表 | |
| `defaultRent` | Decimal | Not Null | **預設租金** | |
| `defaultDeposit` | Decimal | Not Null | **預設押金** | |
| `defaultElectricityFee`| Decimal | Default(5) | 預設電費 (元/度) | |
| `defaultWaterFee` | Decimal | Default(0) | 預設水費 (元/月或元/度) | |
| `defaultManagementFee`| Decimal | Default(0) | 預設管理費 | |
| `equipmentList` | JSON | | 設備清單 (包含設備名稱與照片) | |
| `status` | Enum | AVAILABLE, RENTED, UNDER_MAINTENANCE | 物業狀態 | |
| `createdAt` | DateTime | Default(now()) | 建立時間 | |

> **必須資料**：房號、地址、類型、坪數、預設租金、預設押金。

---

## 4. 📝 租約與交易模組 (Lease & Contracts)

### 📜 `Contract` (房客與租約表)
房客主要記錄聯絡人資訊與該次合約的具體細節。

| 欄位名稱 | 型別 | 屬性 | 說明 | 關聯性 |
| :--- | :--- | :--- | :--- | :--- |
| `id` | UUID | PK, Default(uuid_generate_v4()) | 租約/房客記錄編號 | |
| `propertyId` | UUID | FK, Not Null | 租賃標的房源 | Property.id |
| `tenantId` | UUID | FK, Not Null | 簽約房客 (關聯 User 表) | User.id |
| `tenantName` | String | Not Null | **房客姓名** | |
| `gender` | String | Not Null | **性別** (MALE, FEMALE, OTHER) | |
| `phone` | String | Not Null | **電話** | |
| `contactAddress` | String | Not Null | **聯絡地址** | |
| `startDate` | DateTime | Not Null | **起租日** (預設為新建資料日) | |
| `endDate` | DateTime | Not Null | **結束日** (預設為起租日 + 1年) | |
| `monthlyRent` | Decimal | Not Null | **月租金** (初始值自帶房源預設租金) | |
| `deposit` | Decimal | Not Null | **押金** (初始值自帶房源預設押金) | |
| `signingDate` | DateTime | Not Null | **簽約日** (預設為新建資料日) | |
| `paymentCycle` | Enum | Default(MONTHLY) | **繳租週期** (MONTHLY, QUARTERLY, YEARLY) | |
| `electricityRate` | Decimal | Nullable | 電費單價 (元/度) | |
| `startElectricityMeter`| Decimal | Default(0) | 起始電表度數 | |
| `waterRate` | Decimal | Nullable | 水費單價 | |
| `startWaterMeter` | Decimal | Default(0) | 起始水表度數 | |
| `managementFee` | Decimal | Nullable | 管理費 | |
| `status` | Enum | OCCUPIED, VACATED | **狀態管理** (承租中/退租; 預設承租中) | |
| `createdAt` | DateTime | Default(now()) | 記錄建立時間 | |

> **必須資料**：姓名, 性別, 電話, 聯絡地址、起租日, 結束日, 月租金, 押金, 簽約日、繳租週期、狀態。
> **初始值設定**：
> - 起租日：新建資料當日
> - 結束日：預設一年
> - 月租金：參考房源之 `defaultRent`
> - 押金：參考房源之 `defaultDeposit` (建立時，系統前端建議值為月租金 * 2)
> - 簽約日：新建資料當日
> - 繳租週期：預設月繳 (MONTHLY)
> - 電費單價：參考房源之 `defaultElectricityFee` (系統預設 5 元/度)
> - 起始電表度數：預設 0
> - 水費單價：參考房源之 `defaultWaterFee`
> - 起始水表度數：預設 0
> - 管理費：參考房源之 `defaultManagementFee`
> - 狀態：預設承租中 (OCCUPIED)

---

## 5. ✉️ 邀請碼與註冊模組 (Invitations)

### ✉️ `Invitation` (邀請碼表)
| 欄位名稱 | 型別 | 屬性 | 說明 | 關聯性 |
| :--- | :--- | :--- | :--- | :--- |
| `id` | UUID | PK | | |
| `code` | String | Unique, Not Null | 邀請代碼 (給用戶註冊用) | |
| `inviterId` | UUID | FK | 邀請人 ID | User.id |
| `organizationId` | UUID | FK | 目標組織 ID (可選) | Organization.id |
| `propertyId` | UUID | FK | 目標綁定房源 (房客專用) | Property.id |
| `targetRole` | Enum | ADMIN, LANDLORD, MANAGER, TENANT | 預計授予的角色 | |
| `targetPlan` | Enum | FREE, STARTER, PRO | 預計授予的方案 (Landlord 專用) | |
| `isUsed` | Boolean | Default(false) | 是否已使用 | |
| `expiresAt` | DateTime | | 過期時間 | |

---

## 6. 💰 收款與帳單模組 (Billing & Payments)

### 📅 `Billing` (帳單表)
| 欄位名稱 | 型別 | 屬性 | 說明 | 關聯性 |
| :--- | :--- | :--- | :--- | :--- |
| `id` | UUID | PK, Default(uuid_generate_v4()) | 帳單唯一識別碼 | |
| `contractId` | UUID | FK, Not Null | 關連租約 | Contract.id |
| `periodStart` | DateTime | Not Null | 帳單期間-起 | |
| `periodEnd` | DateTime | Not Null | 帳單期間-止 | |
| `monthlyRent` | Decimal | Not Null | 該期租金 (依租約) | |
| `managementFee` | Decimal | Not Null | 該期管理費 (依租約) | |
| `electricityRate` | Decimal | Nullable | 電費單價 (依租約) | |
| `startElectricityMeter`| Decimal | Nullable | 當期起始電表度數 (前次當期度數) | |
| `endElectricityMeter` | Decimal | Nullable | 當期結束電表度數 (房客輸入) | |
| `waterRate` | Decimal | Nullable | 水費單價 | |
| `startWaterMeter` | Decimal | Nullable | 當期起始水表度數 | |
| `endWaterMeter` | Decimal | Nullable | 當期結束水表度數 (房客輸入) | |
| `previousUnpaid` | Decimal | Default(0) | 前期未繳金額 | |
| `totalAmount` | Decimal | | 應收總金額 (系統自動計算) | |
| `status` | Enum | PENDING_TENANT, PENDING_APPROVAL, COMPLETED | 帳單狀態 | |
| `createdAt` | DateTime | Default(now()) | 建立時間 | |

### 💳 `Payment` (繳款資訊表)
| 欄位名稱 | 型別 | 屬性 | 說明 | 關聯性 |
| :--- | :--- | :--- | :--- | :--- |
| `id` | UUID | PK, Default(uuid_generate_v4()) | 繳款記錄編號 | |
| `billingId` | UUID | FK, Not Null | 關連帳單 | Billing.id |
| `amount` | Decimal | Not Null | **匯款金額** | |
| `paymentDate` | DateTime | Not Null | **匯款日期** | |
| `accountLastThree` | String | Not Null | **帳號末三碼** | |
| `receiptPhotoUrl` | String | Nullable | 上傳附圖 (可選) | |
| `landlordRemark` | String | Nullable | 房東/代管 備註 | |
| `createdAt` | DateTime | Default(now()) | 提交時間 | |

---

## 7. 🛠️ 維修管理模組 (Maintenance)

### 🔧 `Maintenance` (修繕記錄表)
| 欄位名稱 | 型別 | 屬性 | 說明 | 關聯性 |
| :--- | :--- | :--- | :--- | :--- |
| `id` | UUID | PK, Default(uuid_generate_v4()) | 維修記錄唯一識別碼 | |
| `contractId` | UUID | FK, Not Null | 關連租約 (確認報修房客) | Contract.id |
| `item` | String | Not Null | **修繕項目** (設備名稱或自行輸入) | |
| `description` | String | Not Null | **問題描述** | |
| `photos` | String[] | | 問題照片 URL 列表 (Cloudinary) | |
| `status` | Enum | PENDING, PROCESSING, COMPLETED, CANCELLED | **狀態** (預設 PENDING) | |
| `landlordReply` | String | Nullable | **房東/代管 回覆** | |
| `createdAt` | DateTime | Default(now()) | 建立時間 | |
| `updatedAt` | DateTime | UpdatedAt | 最後更新時間 | |

---

## 8. 🛡️ 系統稽核模組 (Audit Logs)

### 📝 `AuditLog` (稽核日誌表)
| 欄位名稱 | 型別 | 屬性 | 說明 | 關聯性 |
| :--- | :--- | :--- | :--- | :--- |
| `id` | UUID | PK | | |
| `userId` | UUID | FK | 執行者 ID | User.id |
| `organizationId` | UUID | FK | 所屬組織 ID | Organization.id |
| `action` | String | Not Null | 執行動作 (如: INVITE_TENANT) | |
| `targetType` | String | Not Null | 目標類型 (如: PROPERTY, USER) | |
| `targetId` | String | | 目標 ID | |
| `metadata` | JSON | | 詳細資訊 (如: 舊值、新值) | |
| `createdAt` | DateTime | Default(now()) | 記錄時間 | |

---

## 9. 尚未實作或建議的部分 (Future Roadmap)

### 📢 通知系統建議 (Notifications)
建議建立 `Notification` 表以追蹤系統推送給用戶的各種通知。
- 範例：`userId`, `type` (INFO, ALERT), `title`, `content`, `isRead`

### 🏷️ 優惠與折扣模組 (Coupons/Discounts)
若未來要推廣訂閱方案，可建立此表。
- 範例：`code`, `discountType` (PERCENT, FIXED), `amount`, `expiresAt`

### 🏦 房東收款帳戶資訊 (Payout Accounts)
用於紀錄房東或組織的匯款帳號資訊，方便房客在帳單畫面上直接看到。
- 範例：`organizationId`, `bankCode`, `bankAccount`, `accountName`

### 💬 報修即時通訊 (Maintenance Chat)
在報修單下建立簡單的留言板。
- 範例：`maintenanceId`, `senderId`, `message`, `createdAt`