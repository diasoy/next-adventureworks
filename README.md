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

## 🔌 Integrasi dengan Mondrian OLAP

Beberapa page menggunakan iframe untuk menampilkan data dari Mondrian OLAP Server di `http://localhost:8080/mondrian/`.

Pastikan Mondrian OLAP Server sudah berjalan jika ingin menggunakan fitur ini.

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

## 📄 License

This project is private and for educational purposes.

## 👨‍💻 Author

Created for AdventureWorks Data Warehouse Analytics Project.
