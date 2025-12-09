-- CreateTable
CREATE TABLE `dim_dates` (
    `date_key` INTEGER NOT NULL,
    `full_date` DATETIME(3) NOT NULL,
    `day` INTEGER NOT NULL,
    `month` INTEGER NOT NULL,
    `month_name` VARCHAR(191) NOT NULL,
    `quarter` INTEGER NOT NULL,
    `year` INTEGER NOT NULL,
    `is_weekend` BOOLEAN NOT NULL,

    UNIQUE INDEX `dim_dates_full_date_key`(`full_date`),
    INDEX `dim_dates_year_month_idx`(`year`, `month`),
    PRIMARY KEY (`date_key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dim_products` (
    `product_key` INTEGER NOT NULL,
    `product_name` VARCHAR(191) NOT NULL,
    `product_number` VARCHAR(191) NOT NULL,
    `color` VARCHAR(191) NULL,
    `size` VARCHAR(191) NULL,
    `standard_cost` DECIMAL(19, 4) NULL,
    `list_price` DECIMAL(19, 4) NULL,
    `product_subcategory_id` INTEGER NULL,
    `product_subcategory_name` VARCHAR(191) NULL,
    `product_category_id` INTEGER NULL,
    `product_category_name` VARCHAR(191) NULL,

    INDEX `dim_products_product_category_name_product_subcategory_name_idx`(`product_category_name`, `product_subcategory_name`),
    PRIMARY KEY (`product_key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dim_customers` (
    `customer_key` INTEGER NOT NULL,
    `account_number` VARCHAR(191) NOT NULL,
    `customer_name` VARCHAR(191) NOT NULL,
    `customer_type` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `territory_key` INTEGER NULL,

    INDEX `dim_customers_territory_key_idx`(`territory_key`),
    PRIMARY KEY (`customer_key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dim_salespersons` (
    `salesperson_key` INTEGER NOT NULL,
    `salesperson_name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `job_title` VARCHAR(191) NULL,
    `sales_quota` DECIMAL(19, 4) NULL,
    `commission_pct` DECIMAL(5, 4) NULL,
    `territory_key` INTEGER NULL,

    INDEX `dim_salespersons_territory_key_idx`(`territory_key`),
    PRIMARY KEY (`salesperson_key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dim_sales_territories` (
    `territory_key` INTEGER NOT NULL,
    `territory_name` VARCHAR(191) NOT NULL,
    `country_region_code` VARCHAR(191) NULL,
    `group_name` VARCHAR(191) NULL,

    PRIMARY KEY (`territory_key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dim_warehouses` (
    `warehouse_key` INTEGER NOT NULL,
    `warehouse_name` VARCHAR(191) NOT NULL,
    `location_name` VARCHAR(191) NULL,

    PRIMARY KEY (`warehouse_key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fact_sales` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date_key` INTEGER NOT NULL,
    `product_key` INTEGER NOT NULL,
    `customer_key` INTEGER NOT NULL,
    `salesperson_key` INTEGER NULL,
    `territory_key` INTEGER NULL,
    `order_number` INTEGER NOT NULL,
    `order_line_number` INTEGER NULL,
    `order_quantity` INTEGER NOT NULL,
    `unit_price` DECIMAL(19, 4) NOT NULL,
    `unit_price_discount` DECIMAL(19, 4) NOT NULL,
    `discount_rate` DECIMAL(5, 4) NOT NULL,
    `discount_amount` DECIMAL(19, 4) NOT NULL,
    `sales_amount` DECIMAL(19, 4) NOT NULL,
    `standard_cost` DECIMAL(19, 4) NOT NULL,
    `total_cost` DECIMAL(19, 4) NOT NULL,
    `profit_amount` DECIMAL(19, 4) NOT NULL,
    `profit_margin` DECIMAL(5, 4) NOT NULL,

    INDEX `fact_sales_date_key_idx`(`date_key`),
    INDEX `fact_sales_product_key_idx`(`product_key`),
    INDEX `fact_sales_customer_key_idx`(`customer_key`),
    INDEX `fact_sales_salesperson_key_idx`(`salesperson_key`),
    INDEX `fact_sales_territory_key_idx`(`territory_key`),
    INDEX `fact_sales_order_number_idx`(`order_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fact_inventory_monthly` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `product_key` INTEGER NOT NULL,
    `warehouse_key` INTEGER NOT NULL,
    `date_key` INTEGER NOT NULL,
    `begin_qty` INTEGER NOT NULL,
    `end_qty` INTEGER NOT NULL,
    `avg_qty` DOUBLE NOT NULL,
    `inventory_value` DECIMAL(19, 4) NOT NULL,

    INDEX `fact_inventory_monthly_date_key_idx`(`date_key`),
    INDEX `fact_inventory_monthly_product_key_idx`(`product_key`),
    INDEX `fact_inventory_monthly_warehouse_key_idx`(`warehouse_key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `dim_customers` ADD CONSTRAINT `dim_customers_territory_key_fkey` FOREIGN KEY (`territory_key`) REFERENCES `dim_sales_territories`(`territory_key`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dim_salespersons` ADD CONSTRAINT `dim_salespersons_territory_key_fkey` FOREIGN KEY (`territory_key`) REFERENCES `dim_sales_territories`(`territory_key`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fact_sales` ADD CONSTRAINT `fact_sales_date_key_fkey` FOREIGN KEY (`date_key`) REFERENCES `dim_dates`(`date_key`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fact_sales` ADD CONSTRAINT `fact_sales_product_key_fkey` FOREIGN KEY (`product_key`) REFERENCES `dim_products`(`product_key`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fact_sales` ADD CONSTRAINT `fact_sales_customer_key_fkey` FOREIGN KEY (`customer_key`) REFERENCES `dim_customers`(`customer_key`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fact_sales` ADD CONSTRAINT `fact_sales_salesperson_key_fkey` FOREIGN KEY (`salesperson_key`) REFERENCES `dim_salespersons`(`salesperson_key`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fact_sales` ADD CONSTRAINT `fact_sales_territory_key_fkey` FOREIGN KEY (`territory_key`) REFERENCES `dim_sales_territories`(`territory_key`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fact_inventory_monthly` ADD CONSTRAINT `fact_inventory_monthly_date_key_fkey` FOREIGN KEY (`date_key`) REFERENCES `dim_dates`(`date_key`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fact_inventory_monthly` ADD CONSTRAINT `fact_inventory_monthly_product_key_fkey` FOREIGN KEY (`product_key`) REFERENCES `dim_products`(`product_key`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fact_inventory_monthly` ADD CONSTRAINT `fact_inventory_monthly_warehouse_key_fkey` FOREIGN KEY (`warehouse_key`) REFERENCES `dim_warehouses`(`warehouse_key`) ON DELETE RESTRICT ON UPDATE CASCADE;
