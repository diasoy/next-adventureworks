/*
  Warnings:

  - The primary key for the `dim_customers` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `customer_key` on the `dim_customers` table. All the data in the column will be lost.
  - You are about to drop the column `customer_name` on the `dim_customers` table. All the data in the column will be lost.
  - You are about to drop the column `customer_type` on the `dim_customers` table. All the data in the column will be lost.
  - You are about to drop the column `territory_key` on the `dim_customers` table. All the data in the column will be lost.
  - You are about to alter the column `phone` on the `dim_customers` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(50)`.
  - You are about to alter the column `day` on the `dim_dates` table. The data in that column could be lost. The data in that column will be cast from `Int` to `TinyInt`.
  - You are about to alter the column `month` on the `dim_dates` table. The data in that column could be lost. The data in that column will be cast from `Int` to `TinyInt`.
  - You are about to alter the column `month_name` on the `dim_dates` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(20)`.
  - You are about to alter the column `quarter` on the `dim_dates` table. The data in that column could be lost. The data in that column will be cast from `Int` to `TinyInt`.
  - You are about to alter the column `year` on the `dim_dates` table. The data in that column could be lost. The data in that column will be cast from `Int` to `SmallInt`.
  - The primary key for the `dim_products` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `product_key` on the `dim_products` table. All the data in the column will be lost.
  - You are about to alter the column `size` on the `dim_products` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(20)`.
  - You are about to alter the column `standard_cost` on the `dim_products` table. The data in that column could be lost. The data in that column will be cast from `Decimal(19,4)` to `Decimal(18,2)`.
  - You are about to alter the column `list_price` on the `dim_products` table. The data in that column could be lost. The data in that column will be cast from `Decimal(19,4)` to `Decimal(18,2)`.
  - The primary key for the `dim_sales_territories` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `country_region_code` on the `dim_sales_territories` table. All the data in the column will be lost.
  - You are about to drop the column `territory_key` on the `dim_sales_territories` table. All the data in the column will be lost.
  - The primary key for the `dim_salespersons` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `commission_pct` on the `dim_salespersons` table. All the data in the column will be lost.
  - You are about to drop the column `sales_quota` on the `dim_salespersons` table. All the data in the column will be lost.
  - You are about to drop the column `salesperson_key` on the `dim_salespersons` table. All the data in the column will be lost.
  - You are about to drop the column `salesperson_name` on the `dim_salespersons` table. All the data in the column will be lost.
  - You are about to drop the column `territory_key` on the `dim_salespersons` table. All the data in the column will be lost.
  - You are about to alter the column `phone` on the `dim_salespersons` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(50)`.
  - The primary key for the `dim_warehouses` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `location_name` on the `dim_warehouses` table. All the data in the column will be lost.
  - You are about to drop the column `warehouse_key` on the `dim_warehouses` table. All the data in the column will be lost.
  - The primary key for the `fact_inventory_monthly` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `product_key` on the `fact_inventory_monthly` table. All the data in the column will be lost.
  - You are about to drop the column `warehouse_key` on the `fact_inventory_monthly` table. All the data in the column will be lost.
  - You are about to alter the column `inventory_value` on the `fact_inventory_monthly` table. The data in that column could be lost. The data in that column will be cast from `Decimal(19,4)` to `Decimal(18,2)`.
  - The primary key for the `fact_sales` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `customer_key` on the `fact_sales` table. All the data in the column will be lost.
  - You are about to drop the column `product_key` on the `fact_sales` table. All the data in the column will be lost.
  - You are about to drop the column `salesperson_key` on the `fact_sales` table. All the data in the column will be lost.
  - You are about to drop the column `standard_cost` on the `fact_sales` table. All the data in the column will be lost.
  - You are about to drop the column `territory_key` on the `fact_sales` table. All the data in the column will be lost.
  - You are about to drop the column `total_cost` on the `fact_sales` table. All the data in the column will be lost.
  - You are about to drop the column `unit_price_discount` on the `fact_sales` table. All the data in the column will be lost.
  - You are about to alter the column `unit_price` on the `fact_sales` table. The data in that column could be lost. The data in that column will be cast from `Decimal(19,4)` to `Decimal(18,2)`.
  - You are about to alter the column `discount_amount` on the `fact_sales` table. The data in that column could be lost. The data in that column will be cast from `Decimal(19,4)` to `Decimal(18,2)`.
  - You are about to alter the column `sales_amount` on the `fact_sales` table. The data in that column could be lost. The data in that column will be cast from `Decimal(19,4)` to `Decimal(18,2)`.
  - You are about to alter the column `profit_amount` on the `fact_sales` table. The data in that column could be lost. The data in that column will be cast from `Decimal(19,4)` to `Decimal(18,2)`.
  - Added the required column `full_name` to the `dim_customers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `dim_customers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `dim_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `dim_sales_territories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `business_entity_id` to the `dim_salespersons` table without a default value. This is not possible if the table is not empty.
  - Added the required column `full_name` to the `dim_salespersons` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `dim_salespersons` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `dim_warehouses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `product_id` to the `fact_inventory_monthly` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customer_id` to the `fact_sales` table without a default value. This is not possible if the table is not empty.
  - Added the required column `extended_amount` to the `fact_sales` table without a default value. This is not possible if the table is not empty.
  - Added the required column `product_id` to the `fact_sales` table without a default value. This is not possible if the table is not empty.
  - Made the column `order_line_number` on table `fact_sales` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `dim_customers` DROP FOREIGN KEY `dim_customers_territory_key_fkey`;

-- DropForeignKey
ALTER TABLE `dim_salespersons` DROP FOREIGN KEY `dim_salespersons_territory_key_fkey`;

-- DropForeignKey
ALTER TABLE `fact_inventory_monthly` DROP FOREIGN KEY `fact_inventory_monthly_product_key_fkey`;

-- DropForeignKey
ALTER TABLE `fact_inventory_monthly` DROP FOREIGN KEY `fact_inventory_monthly_warehouse_key_fkey`;

-- DropForeignKey
ALTER TABLE `fact_sales` DROP FOREIGN KEY `fact_sales_customer_key_fkey`;

-- DropForeignKey
ALTER TABLE `fact_sales` DROP FOREIGN KEY `fact_sales_product_key_fkey`;

-- DropForeignKey
ALTER TABLE `fact_sales` DROP FOREIGN KEY `fact_sales_salesperson_key_fkey`;

-- DropForeignKey
ALTER TABLE `fact_sales` DROP FOREIGN KEY `fact_sales_territory_key_fkey`;

-- AlterTable
ALTER TABLE `dim_customers` DROP PRIMARY KEY,
    DROP COLUMN `customer_key`,
    DROP COLUMN `customer_name`,
    DROP COLUMN `customer_type`,
    DROP COLUMN `territory_key`,
    ADD COLUMN `city` VARCHAR(255) NULL,
    ADD COLUMN `country` VARCHAR(255) NULL,
    ADD COLUMN `created_at` TIMESTAMP(0) NULL,
    ADD COLUMN `customer_segment` VARCHAR(255) NULL,
    ADD COLUMN `full_name` VARCHAR(255) NOT NULL,
    ADD COLUMN `gender` VARCHAR(1) NULL,
    ADD COLUMN `id` BIGINT NOT NULL AUTO_INCREMENT,
    ADD COLUMN `postal_code` VARCHAR(20) NULL,
    ADD COLUMN `state` VARCHAR(255) NULL,
    ADD COLUMN `updated_at` TIMESTAMP(0) NULL,
    MODIFY `account_number` VARCHAR(255) NOT NULL,
    MODIFY `email` VARCHAR(255) NULL,
    MODIFY `phone` VARCHAR(50) NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `dim_dates` MODIFY `full_date` DATE NOT NULL,
    MODIFY `day` TINYINT NOT NULL,
    MODIFY `month` TINYINT NOT NULL,
    MODIFY `month_name` VARCHAR(20) NOT NULL,
    MODIFY `quarter` TINYINT NOT NULL,
    MODIFY `year` SMALLINT NOT NULL;

-- AlterTable
ALTER TABLE `dim_products` DROP PRIMARY KEY,
    DROP COLUMN `product_key`,
    ADD COLUMN `created_at` TIMESTAMP(0) NULL,
    ADD COLUMN `id` BIGINT NOT NULL AUTO_INCREMENT,
    ADD COLUMN `updated_at` TIMESTAMP(0) NULL,
    MODIFY `product_name` VARCHAR(255) NOT NULL,
    MODIFY `product_number` VARCHAR(255) NULL,
    MODIFY `color` VARCHAR(255) NULL,
    MODIFY `size` VARCHAR(20) NULL,
    MODIFY `standard_cost` DECIMAL(18, 2) NULL,
    MODIFY `list_price` DECIMAL(18, 2) NULL,
    MODIFY `product_subcategory_name` VARCHAR(255) NULL,
    MODIFY `product_category_name` VARCHAR(255) NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `dim_sales_territories` DROP PRIMARY KEY,
    DROP COLUMN `country_region_code`,
    DROP COLUMN `territory_key`,
    ADD COLUMN `country` VARCHAR(255) NULL,
    ADD COLUMN `created_at` TIMESTAMP(0) NULL,
    ADD COLUMN `id` BIGINT NOT NULL AUTO_INCREMENT,
    ADD COLUMN `region` VARCHAR(255) NULL,
    ADD COLUMN `updated_at` TIMESTAMP(0) NULL,
    MODIFY `territory_name` VARCHAR(255) NOT NULL,
    MODIFY `group_name` VARCHAR(255) NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `dim_salespersons` DROP PRIMARY KEY,
    DROP COLUMN `commission_pct`,
    DROP COLUMN `sales_quota`,
    DROP COLUMN `salesperson_key`,
    DROP COLUMN `salesperson_name`,
    DROP COLUMN `territory_key`,
    ADD COLUMN `business_entity_id` INTEGER NOT NULL,
    ADD COLUMN `created_at` TIMESTAMP(0) NULL,
    ADD COLUMN `full_name` VARCHAR(255) NOT NULL,
    ADD COLUMN `id` BIGINT NOT NULL AUTO_INCREMENT,
    ADD COLUMN `territory_id` BIGINT NULL,
    ADD COLUMN `updated_at` TIMESTAMP(0) NULL,
    MODIFY `email` VARCHAR(255) NULL,
    MODIFY `phone` VARCHAR(50) NULL,
    MODIFY `job_title` VARCHAR(255) NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `dim_warehouses` DROP PRIMARY KEY,
    DROP COLUMN `location_name`,
    DROP COLUMN `warehouse_key`,
    ADD COLUMN `city` VARCHAR(255) NULL,
    ADD COLUMN `country` VARCHAR(255) NULL,
    ADD COLUMN `created_at` TIMESTAMP(0) NULL,
    ADD COLUMN `id` BIGINT NOT NULL AUTO_INCREMENT,
    ADD COLUMN `state` VARCHAR(255) NULL,
    ADD COLUMN `updated_at` TIMESTAMP(0) NULL,
    MODIFY `warehouse_name` VARCHAR(255) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `fact_inventory_monthly` DROP PRIMARY KEY,
    DROP COLUMN `product_key`,
    DROP COLUMN `warehouse_key`,
    ADD COLUMN `created_at` TIMESTAMP(0) NULL,
    ADD COLUMN `product_id` BIGINT NOT NULL,
    ADD COLUMN `updated_at` TIMESTAMP(0) NULL,
    ADD COLUMN `warehouse_id` BIGINT NULL,
    MODIFY `id` BIGINT NOT NULL AUTO_INCREMENT,
    MODIFY `begin_qty` INTEGER NULL,
    MODIFY `end_qty` INTEGER NULL,
    MODIFY `avg_qty` DECIMAL(18, 2) NULL,
    MODIFY `inventory_value` DECIMAL(18, 2) NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `fact_sales` DROP PRIMARY KEY,
    DROP COLUMN `customer_key`,
    DROP COLUMN `product_key`,
    DROP COLUMN `salesperson_key`,
    DROP COLUMN `standard_cost`,
    DROP COLUMN `territory_key`,
    DROP COLUMN `total_cost`,
    DROP COLUMN `unit_price_discount`,
    ADD COLUMN `cost_amount` DECIMAL(18, 2) NULL,
    ADD COLUMN `created_at` TIMESTAMP(0) NULL,
    ADD COLUMN `customer_id` BIGINT NOT NULL,
    ADD COLUMN `extended_amount` DECIMAL(18, 2) NOT NULL,
    ADD COLUMN `product_id` BIGINT NOT NULL,
    ADD COLUMN `salesperson_id` BIGINT NULL,
    ADD COLUMN `territory_id` BIGINT NULL,
    ADD COLUMN `updated_at` TIMESTAMP(0) NULL,
    MODIFY `id` BIGINT NOT NULL AUTO_INCREMENT,
    MODIFY `order_number` VARCHAR(50) NOT NULL,
    MODIFY `order_line_number` INTEGER NOT NULL DEFAULT 1,
    MODIFY `unit_price` DECIMAL(18, 2) NOT NULL,
    MODIFY `discount_rate` DECIMAL(5, 4) NOT NULL DEFAULT 0.0000,
    MODIFY `discount_amount` DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    MODIFY `sales_amount` DECIMAL(18, 2) NOT NULL,
    MODIFY `profit_amount` DECIMAL(18, 2) NULL,
    MODIFY `profit_margin` DECIMAL(5, 4) NULL,
    ADD PRIMARY KEY (`id`);

-- CreateIndex
CREATE INDEX `dim_salespersons_territory_id_idx` ON `dim_salespersons`(`territory_id`);

-- CreateIndex
CREATE INDEX `fact_inventory_monthly_product_id_idx` ON `fact_inventory_monthly`(`product_id`);

-- CreateIndex
CREATE INDEX `fact_inventory_monthly_warehouse_id_idx` ON `fact_inventory_monthly`(`warehouse_id`);

-- CreateIndex
CREATE INDEX `fact_sales_product_id_idx` ON `fact_sales`(`product_id`);

-- CreateIndex
CREATE INDEX `fact_sales_customer_id_idx` ON `fact_sales`(`customer_id`);

-- CreateIndex
CREATE INDEX `fact_sales_salesperson_id_idx` ON `fact_sales`(`salesperson_id`);

-- CreateIndex
CREATE INDEX `fact_sales_territory_id_idx` ON `fact_sales`(`territory_id`);

-- AddForeignKey
ALTER TABLE `dim_salespersons` ADD CONSTRAINT `dim_salespersons_territory_id_fkey` FOREIGN KEY (`territory_id`) REFERENCES `dim_sales_territories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fact_inventory_monthly` ADD CONSTRAINT `fact_inventory_monthly_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `dim_products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fact_inventory_monthly` ADD CONSTRAINT `fact_inventory_monthly_warehouse_id_fkey` FOREIGN KEY (`warehouse_id`) REFERENCES `dim_warehouses`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fact_sales` ADD CONSTRAINT `fact_sales_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `dim_products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fact_sales` ADD CONSTRAINT `fact_sales_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `dim_customers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fact_sales` ADD CONSTRAINT `fact_sales_salesperson_id_fkey` FOREIGN KEY (`salesperson_id`) REFERENCES `dim_salespersons`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fact_sales` ADD CONSTRAINT `fact_sales_territory_id_fkey` FOREIGN KEY (`territory_id`) REFERENCES `dim_sales_territories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
