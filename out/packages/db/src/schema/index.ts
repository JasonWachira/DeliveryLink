// packages/db/src/schema/index.ts

import { relations } from "drizzle-orm";

import { customers } from "./customer.js";
import { businesses } from "./businesses.js";
import { drivers } from "./drivers.js";
import { orders } from "./order.js";
import { items } from "./items.js";
import { orderItems } from "./orderItems.js";
import { financialTransactions } from "./financialTransactions.js";
import { deliveryUpdates } from "./deliveryUpdate.js";

export const customerRelations = relations(customers, ({ many }) => ({
    
    orders: many(orders),
}));


export const businessRelations = relations(businesses, ({ many }) => ({
    
    orders: many(orders),
}));


export const driverRelations = relations(drivers, ({ many }) => ({
   
    orders: many(orders),
}));


export const itemRelations = relations(items, ({ many }) => ({
    
    orderItems: many(orderItems),
}));


export const orderRelations = relations(orders, ({ one, many }) => ({
    
    customer: one(customers, {
        fields: [orders.customerId],
        references: [customers.customerId],
    }),
    
    business: one(businesses, {
        fields: [orders.businessId],
        references: [businesses.businessId],
    }),
    
    driver: one(drivers, {
        fields: [orders.driverId],
        references: [drivers.driverId],
    }),
    
    transactions: many(financialTransactions),
    
    deliveryUpdates: many(deliveryUpdates),
    
    orderItems: many(orderItems),
}));


export const orderItemRelations = relations(orderItems, ({ one }) => ({
    
    order: one(orders, {
        fields: [orderItems.orderId],
        references: [orders.orderId],
    }),
    
    item: one(items, {
        fields: [orderItems.itemId],
        references: [items.itemId],
    }),
}));


export const deliveryUpdateRelations = relations(deliveryUpdates, ({ one }) => ({
    
    order: one(orders, {
        fields: [deliveryUpdates.orderId],
        references: [orders.orderId],
    }),
}));


export const financialTransactionRelations = relations(financialTransactions, ({ one }) => ({
    
    order: one(orders, {
        fields: [financialTransactions.orderId],
        references: [orders.orderId],
    }),
}));