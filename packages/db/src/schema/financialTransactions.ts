import { pgTable, serial, integer, text, numeric, timestamp } from "drizzle-orm/pg-core";
import { orders } from "./order";


export const financialTransactions = pgTable("financial_transaction", {
 
  transactionId: serial("transaction_id").primaryKey(),
  
  // Foreign Key
  orderId: integer("order_id")  
    .references(() => orders.orderId)
    .notNull(),
    
  // Attributes
  transactionType: text("transaction_type").notNull(), 
  transactionStatus: text("transaction_status").notNull(), 
  amount: numeric("amount").notNull(), 
  date: timestamp("date").defaultNow().notNull(),  
});