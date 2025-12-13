# Next AdventureWorks - Data Warehouse & Analytics Dashboard

Project ini adalah dashboard analytics berbasis **Next.js** yang terhubung dengan database **AdventureWorks Data Warehouse**. Dashboard ini menampilkan berbagai analisis bisnis seperti sales, inventory turnover, bundling analysis, discount territory, purchase frequency, dan salesperson retention.

## 📋 Prerequisites

Pastikan Anda telah menginstall software berikut:

- **Node.js** (v18 atau lebih baru)
- **MySQL** (v8.0 atau lebih baru)
- **Pentaho Data Integration (PDI)** / Kettle (untuk menjalankan ETL)
- **Mondrian OLAP Server** (opsional, untuk analisis OLAP)

## 🚀 Cara Menjalankan Project

### 1. Clone Repository

```bash
git clone <repository-url>
cd next-adventureworks
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Database

#### a. Buat Database MySQL

Buat database baru di MySQL:

```sql
CREATE DATABASE next_adventureworks;
```

#### b. Import Database Schema

Import file SQL yang tersedia di folder `assets/database/`:

```bash
mysql -u root -p next_adventureworks < assets/database/next_adventureworks.sql
```

Atau melalui MySQL Workbench/phpMyAdmin:
1. Buka MySQL Workbench
2. Pilih database `next_adventureworks`
3. Import file `assets/database/next_adventureworks.sql`

### 4. Konfigurasi Environment Variables

Buat file `.env` di root project dan isi dengan konfigurasi database Anda:

```env
DATABASE_URL="mysql://username:password@localhost:3306/next_adventureworks"
```

Ganti `username` dan `password` dengan kredensial MySQL Anda.

### 5. Setup Prisma

Jalankan Prisma migration untuk membuat/update schema:

```bash
npx prisma migrate dev
```

Generate Prisma Client:

```bash
npx prisma generate
```

### 6. Seed Data (Opsional)

Jika Anda ingin mengisi data awal menggunakan Prisma seed:

```bash
npm run prisma:seed
```

### 7. ETL Process dengan Pentaho

Project ini menyediakan file ETL (Extract, Transform, Load) menggunakan Pentaho Data Integration di folder `assets/etl/`:

- `fact_sales.ktr` - ETL untuk tabel fact_sales
- `fact_inventory_monthly.ktr` - ETL untuk tabel fact_inventory_monthly

#### Cara Menjalankan ETL:

1. **Buka Pentaho Data Integration (Spoon)**
2. **Load file transformasi** (.ktr) dari folder `assets/etl/`
3. **Konfigurasi koneksi database**:
   - Klik kanan pada file transformasi → Edit Connection
   - Sesuaikan hostname, port, database name, username, dan password
4. **Run transformasi**:
   - Klik tombol "Run" (▶️) atau tekan F9
   - Pilih "Local execution"
   - Klik "Launch"
5. **Verifikasi data** telah terload ke tabel fact dengan query:

```sql
SELECT COUNT(*) FROM fact_sales;
SELECT COUNT(*) FROM fact_inventory_monthly;
```

#### Urutan Menjalankan ETL:

1. Pastikan data di tabel dimensi (`dim_dates`, `dim_products`, `dim_customers`, dll.) sudah terisi
2. Jalankan `fact_sales.ktr` terlebih dahulu
3. Jalankan `fact_inventory_monthly.ktr`

### 8. Jalankan Development Server

```bash
npm run dev
```

Buka browser dan akses [http://localhost:3000](http://localhost:3000)

## 📊 Fitur Dashboard

Dashboard ini menyediakan analisis berikut:

1. **Dashboard Utama** (`/`) - Overview metrics penjualan
2. **Inventory Turnover** (`/inventory-turnover`) - Analisis perputaran inventory
3. **Bundling Analysis** (`/bundling`) - Analisis produk yang sering dibeli bersamaan
4. **Discount Territory** (`/discount-territory`) - Analisis efektivitas diskon per wilayah
5. **Purchase Frequency** (`/purchase-frequency`) - Analisis frekuensi pembelian customer
6. **Salesperson Retention** (`/salesperson-retention`) - Analisis retention rate salesperson

## 🗂️ Struktur Folder

```
next-adventureworks/
├── assets/
│   ├── database/           # File SQL database
│   │   └── next_adventureworks.sql
│   └── etl/               # File ETL Pentaho
│       ├── fact_sales.ktr
│       └── fact_inventory_monthly.ktr
├── prisma/
│   ├── schema.prisma      # Prisma schema
│   ├── seed.ts           # Seed script
│   └── migrations/        # Migration history
├── src/
│   ├── app/
│   │   ├── api/          # API routes
│   │   └── */            # Page components
│   ├── components/       # Reusable components
│   └── lib/             # Utilities & helpers
└── public/              # Static assets
```

## 🔧 Scripts Available

```bash
npm run dev          # Jalankan development server
npm run build        # Build untuk production
npm start            # Jalankan production server
npm run lint         # Jalankan linter
npm run prisma:seed  # Jalankan seed script
```

## 🔌 Integrasi dengan Mondrian OLAP Server

Project ini menggunakan **Mondrian OLAP Server** untuk analisis multidimensional yang mendalam, terutama pada fitur **Salesperson Retention** dan **Inventory Turnover**. OLAP (Online Analytical Processing) memungkinkan drill-down dan cross-filtering interaktif pada data warehouse.

### Setup Mondrian OLAP Server

#### 1. Download & Install Mondrian

- Download **Apache Tomcat** (v9.x atau lebih baru) dari [https://tomcat.apache.org](https://tomcat.apache.org)
- Download **Mondrian WAR** file atau gunakan distribution Pentaho BI Server

#### 2. Deploy Mondrian ke Tomcat

1. Extract Apache Tomcat ke folder pilihan Anda (misal: `C:\tomcat`)
2. Copy file WAR Mondrian ke folder `tomcat/webapps/`
3. Copy file `salesperson_retention.xml` dari `assets/olap/` ke `tomcat/webapps/mondrian/WEB-INF/queries/`

#### 3. Konfigurasi Database Connection

Edit file schema XML (`salesperson_retention.xml`) dan sesuaikan JDBC connection string:

```xml
jdbcDriver="com.mysql.cj.jdbc.Driver" 
jdbcUrl="jdbc:mysql://localhost:3306/next_adventureworks?user=root&password=YOUR_PASSWORD"
```

Ganti `YOUR_PASSWORD` dengan password MySQL Anda.

#### 4. Deploy File OLAP ke Tomcat

Copy seluruh file dari folder `assets/olap/` ke `tomcat/webapps/mondrian/`:

```bash
cp assets/olap/*.jsp tomcat/webapps/mondrian/
cp assets/olap/*.html tomcat/webapps/mondrian/
cp assets/olap/salesperson_retention.xml tomcat/webapps/mondrian/WEB-INF/queries/
```

#### 5. Jalankan Tomcat Server

Windows:
```bash
cd C:\tomcat\bin
startup.bat
```

Linux/Mac:
```bash
cd /path/to/tomcat/bin
./startup.sh
```

Server akan berjalan di `http://localhost:8080`

#### 6. Akses OLAP Dashboard

Buka browser dan akses:
- **Index OLAP**: `http://localhost:8080/mondrian/index.html`
- **Salesperson Retention**: `http://localhost:8080/mondrian/testpage.jsp?query=retention_salesperson`
- **Territory Analysis**: `http://localhost:8080/mondrian/testpage.jsp?query=retention_territory`
- **Time Series**: `http://localhost:8080/mondrian/testpage.jsp?query=retention_timeseries`

### Fitur OLAP yang Tersedia

File OLAP di folder `assets/olap/` menyediakan 6 analisis interaktif:

1. **retention_salesperson.jsp** - Detail Retention per Salesperson
   - Drill-down: Territory → Salesperson
   - Metrics: Total Sales, Orders, Customers, Profit, Avg per Customer

2. **retention_territory.jsp** - Retention by Territory
   - Drill-down: Group → Region → Territory
   - Cross-filter berdasarkan hierarki geografis

3. **retention_timeseries.jsp** - Retention Time Series
   - Drill-down: Year → Quarter → Month
   - Analisis trend temporal

4. **retention_product.jsp** - Retention by Product
   - Drill-down: Category → Subcategory → Product
   - Analisis per produk level detail

5. **retention_customer.jsp** - Customer Retention Analysis
   - Drill-down: Segment → Customer
   - Analisis retensi per customer segment

6. **retention_multidim.jsp** - Multi-dimensional Analysis
   - Cross-filter: Salesperson × Product × Time
   - Analisis 3 dimensi sekaligus

### Schema Mondrian XML

File `salesperson_retention.xml` mendefinisikan:
- **Cube**: "Retention" dengan fact table `fact_sales`
- **Dimensions**: Salesperson, Customer, Product, Time, Territory
- **Measures**: Total Sales, Orders, Customers, Profit, Margins
- **Hierarchies**: Drill-down paths untuk setiap dimensi

### Integrasi dengan Next.js Dashboard

Halaman **Inventory Turnover** (`/dashboard/inventory-turnover`) menggunakan iframe untuk embed OLAP Mondrian:

```html
<iframe src="http://localhost:8080/mondrian/testpage.jsp?query=retention_salesperson" />
```

Pastikan Mondrian OLAP Server sudah berjalan di port 8080 agar fitur ini dapat berfungsi dengan baik.

## 📝 Technology Stack

- **Frontend**: Next.js 16, React 19, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: MySQL 8.0
- **ORM**: Prisma
- **Charts**: Recharts
- **UI Components**: Radix UI, shadcn/ui
- **ETL**: Pentaho Data Integration
- **OLAP**: Mondrian (opsional)

## ⚠️ Troubleshooting

### Error: Connection to database failed
- Pastikan MySQL service sudah berjalan
- Periksa kredensial di file `.env`
- Pastikan database `next_adventureworks` sudah dibuat

### Error: Table not found
- Jalankan `npx prisma migrate dev` untuk membuat tabel
- Import file SQL dari `assets/database/next_adventureworks.sql`

### ETL Process gagal
- Periksa koneksi database di Pentaho
- Pastikan tabel dimensi sudah terisi data
- Cek log error di Pentaho untuk detail masalah

### OLAP Mondrian tidak bisa diakses
- Pastikan Tomcat server sudah running di port 8080
- Cek apakah file WAR Mondrian sudah ter-deploy di `webapps/mondrian`
- Periksa JDBC connection string di file XML schema
- Lihat log Tomcat di `tomcat/logs/catalina.out` untuk error detail
- Pastikan MySQL JDBC Driver (mysql-connector-java.jar) ada di `tomcat/lib/`

### Iframe OLAP di dashboard tidak muncul
- Pastikan Mondrian server berjalan di `http://localhost:8080/mondrian/`
- Periksa browser console untuk CORS atau mixed content errors
- Coba akses URL OLAP langsung di browser untuk verifikasi

## 📄 License

This project is private and for educational purposes.

## 👨‍💻 Author

Created for AdventureWorks Data Warehouse Analytics Project.
