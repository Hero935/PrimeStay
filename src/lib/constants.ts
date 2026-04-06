/**
 * SaaS 訂閱方案定價與限制配置
 */
export const SUBSCRIPTION_PLANS = {
  FREE: {
    name: "Free",
    monthlyPrice: 0,
    propertyLimit: 2,
    description: "測試用房東、體驗用戶。",
  },
  STARTER: {
    name: "Starter",
    monthlyPrice: 299,
    propertyLimit: 10,
    description: "小型房東、獨立代管人員。",
  },
  PRO: {
    name: "Pro",
    monthlyPrice: 999,
    propertyLimit: 50,
    description: "專業代管公司、多房產房東。",
  },
} as const;

export type PlanKey = keyof typeof SUBSCRIPTION_PLANS;