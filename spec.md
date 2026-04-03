# 🏠 高端租屋代管平台系統規格文件 (spec.md)

## 1. 系統概述
本系統旨在提供高端租屋代管服務，支援多組織（Organization）架構，並針對四種角色（平台管理員、房東、代管人員、租客）提供嚴格的權限控管與自動化流程。

## 2. 技術棧
- **Frontend/Backend**: Next.js 14 (App Router)
- **Database ORM**: Prisma
- **Database**: PostgreSQL (Managed on Railway)
- **Storage**: Cloudinary (用於房源照片、修繕照片、匯款憑證)
- **Deployment**: Railway (容器化部署)
- **Auth**: NextAuth.js

## 3. 系統流程與圖表

### 3.1 角色註冊與加入流程圖 (Flowchart)
```mermaid
graph TD
    Start((系統開始)) --> AdminInit[平台管理者 Init]
    AdminInit --> L_Invite[建立/邀請 房東]
    L_Invite --> LandlordReg[房東註冊/啟用]
    LandlordReg --> CreateOrg[自動建立 Organization]
    
    CreateOrg --> M_Invite[房東/管理者 邀請 代管]
    M_Invite --> ManagerReg[代管註冊/加入組織]
    
    CreateOrg --> P_Create[建立房源 Property]
    P_Create --> C_Template[設定租約範本/預設值]
    
    ManagerReg --> T_Invite[房東/代管 邀請 房客]
    T_Invite --> TenantReg[房客憑代碼註冊]
    TenantReg --> BindAsset[自動綁定房源與租約]
    BindAsset --> End((流程結束))
```

### 3.2 房客加入循序圖 (Sequence Diagram)
```mermaid
sequenceDiagram
    participant L as Landlord/Manager
    participant S as System
    participant T as Tenant
    
    L->>S: 生成邀請碼 (含房源與租約資訊)
    S-->>L: 傳回邀請碼
    L->>T: 發送邀請碼
    T->>S: 提交邀請碼註冊
    S->>S: 驗證代碼有效性
    S->>S: 建立房客帳號 (User Role: TENANT)
    S->>S: 綁定租約 (Contract) 與房源關係
    S-->>T: 註冊完成並登入
```

### 3.3 資料實體關聯圖 (ERD)
```mermaid
erDiagram
    User ||--o{ UserOrganization : belongs_to
    Organization ||--o{ UserOrganization : has_members
    Organization ||--o{ Property : owns
    Property ||--o{ Contract : has
    User ||--o{ Contract : signs_as_tenant
    User ||--o{ Invitation : creates_or_receives
    Contract ||--o{ Billing : generates
    Billing ||--o| Payment : has
    Contract ||--o{ Maintenance : has

    User {
        uuid id PK
        string email
        string name
        enum systemRole "ADMIN, LANDLORD, MANAGER, TENANT"
        datetime createdAt
    }

    Organization {
        uuid id PK
        string name
        uuid ownerId FK
        datetime createdAt
    }

    UserOrganization {
        uuid id PK
        uuid userId FK
        uuid organizationId FK
        enum memberRole "OWNER, MANAGER"
    }

    Property {
        uuid id PK
        uuid organizationId FK
        string address
        string roomNumber
        string type
        decimal size
        stringArray photos "Cloudinary URLs"
        decimal defaultRent
        decimal defaultDeposit
        decimal defaultElectricityFee
        decimal defaultWaterFee
        decimal defaultManagementFee
        json equipmentList
        enum status "AVAILABLE, RENTED, UNDER_MAINTENANCE"
    }

    Contract {
        uuid id PK
        uuid propertyId FK
        uuid tenantId FK
        string tenantName
        datetime startDate
        datetime endDate
        decimal monthlyRent
        decimal deposit
        enum paymentCycle "MONTHLY, QUARTERLY, YEARLY"
        decimal electricityRate
        decimal waterRate
        decimal managementFee
        enum status "OCCUPIED, VACATED"
    }

    Billing {
        uuid id PK
        uuid contractId FK
        datetime periodStart
        datetime periodEnd
        decimal totalAmount
        enum status "PENDING_TENANT, PENDING_APPROVAL, COMPLETED"
    }

    Payment {
        uuid id PK
        uuid billingId FK
        decimal amount
        string receiptPhotoUrl "Cloudinary URL"
        enum status "SUBMITTED, VERIFIED, REJECTED"
    }

    Maintenance {
        uuid id PK
        uuid contractId FK
        string item
        string description
        stringArray photos "Cloudinary URLs"
        enum status "PENDING, PROCESSING, COMPLETED"
    }
```

### 3.4 收款流程圖 (Flowchart)
```mermaid
graph TD
    Start((租約生效)) --> AutoGen[系統定期生成當期帳單紀錄]
    AutoGen --> T_Input[房客輸入水電度數]
    T_Input --> Calc[系統自動計算應收總金額]
    Calc --> T_Pay[房客上傳憑證至 Cloudinary]
    T_Pay --> L_Verify[房東審核收款資訊]
    L_Verify --> Approved{審核通過?}
    Approved -- Yes --> Comp[狀態變更為 COMPLETED]
    Approved -- No --> ReInput[通知房客重新輸入]
    ReInput --> T_Input
```

### 3.5 部署架構圖 (UML Component Diagram)
```mermaid
graph LR
    User((User Browser)) -- HTTPS --> NextJS[Next.js App on Railway]
    NextJS -- ORM --> Postgres[(PostgreSQL on Railway)]
    NextJS -- SDK --> Cloudinary[Cloudinary Image Cloud]
    NextJS -- SMTP --> Mail[Email Service]
```

## 4. 權限控管原則
- **platform_admin**: 全系統存取權，不屬於特定組織。
- **landlord**: 組織擁有者，可管理所屬組織、房源、代管人員、所有財務報表。
- **manager**: 組織成員，根據房東授權範圍管理房源、租約、帳單催收。
- **tenant**: 僅能查看關聯的租約、匯報度數、上傳繳費憑證、報修。

## 5. 外部整合規格
### 5.1 Cloudinary 儲存策略
- **資產分類**:
  - `properties/`: 房源照片
  - `payments/`: 匯款收據憑證 (需設定嚴格存取權)
  - `maintenance/`: 維修報修照片
- **安全性**: 繳費憑證需使用帶簽名的上傳 (Signed Uploads) 或私有存取 URL 確保隱私。

### 5.2 Railway 部署規劃
- **Environment Variables**:
  - `DATABASE_URL`: PostgreSQL 連線字串
  - `NEXTAUTH_SECRET`: 加密金鑰
  - `CLOUDINARY_URL`: Cloudinary 伺服器端 SDK 連線字串
  - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`: Cloudinary Cloud Name (前端上傳元件所需)
  - `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`: Cloudinary 上傳預設值 (前端上傳元件所需)
  - `INVITATION_EXP_DAYS`: 邀請碼有效期設為環境變數 (預設 7 天)