-- 管理端定向扣减积分：追加枚举值，无表结构变更
ALTER TYPE "CreditLedgerEntryType" ADD VALUE 'deduct';
