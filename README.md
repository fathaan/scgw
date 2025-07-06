# 🚀 SAINT CREATE GROUP WHATSAPP (SCGW) BOT
## Installation Guide by @alfathaannn

---

## 📋 REQUIREMENTS
- Node.js v14 atau lebih baru
- NPM atau Yarn
- WhatsApp account
- Internet connection

---

## 💻 INSTALASI DI WINDOWS (PowerShell)

### 1️⃣ Install Node.js
```powershell
# Download dan install Node.js dari: https://nodejs.org/
# Atau gunakan chocolatey jika sudah terinstall:
choco install nodejs

# Verifikasi instalasi
node --version
npm --version
```

### 2️⃣ Clone/Download Project
```powershell
# Buat folder project
mkdir SCGW-Bot
cd SCGW-Bot

# Buat file-file project (copy code dari artifacts)
New-Item -Name "index.js" -ItemType File
New-Item -Name "package.json" -ItemType File
mkdir img

# Copy code dari artifacts ke file masing-masing
```

### 3️⃣ Install Dependencies
```powershell
# Install semua dependencies
npm install

# Atau install satu per satu jika ada error
npm install whatsapp-web.js@1.23.0
npm install chalk@4.1.2
npm install figlet@1.6.0
npm install ora@5.4.1
npm install gradient-string@2.0.2
npm install puppeteer@19.11.1
```

### 4️⃣ Setup Project Structure
```powershell
# Buat folder img untuk foto profil grup
mkdir img

# Download foto profil grup (profil_grub.png) dan letakkan di folder img/
# Atau gunakan foto apapun dengan nama profil_grub.png
```

### 5️⃣ Jalankan Bot
```powershell
# Jalankan bot
npm start

# Atau untuk development
npm run dev
```

---

## 📱 INSTALASI DI ANDROID (Termux)

### 1️⃣ Install Termux
```bash
# Download Termux dari F-Droid: https://f-droid.org/en/packages/com.termux/
# Jangan download dari Google Play Store karena outdated
```

### 2️⃣ Update Termux dan Install Dependencies
```bash
# Update package list
pkg update && pkg upgrade

# Install dependencies
pkg install nodejs npm git

# Install tambahan untuk puppeteer
pkg install chromium

# Verifikasi instalasi
node --version
npm --version
```

### 3️⃣ Setup Project
```bash
# Buat folder project
mkdir SCGW-Bot
cd SCGW-Bot

# Buat file package.json
cat > package.json << 'EOF'
{
  "name": "scgw-bot",
  "version": "1.0.0",
  "description": "Saint Create Group WhatsApp (SCGW) Bot",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "whatsapp-web.js": "^1.23.0",
    "chalk": "^4.1.2",
    "figlet": "^1.6.0",
    "ora": "^5.4.1",
    "gradient-string": "^2.0.2",
    "puppeteer": "^19.11.1"
  }
}
EOF

# Buat folder img
mkdir img
```

### 4️⃣ Install Dependencies
```bash
# Install dependencies
npm install

# Jika ada error dengan puppeteer, install manual:
npm install puppeteer --no-sandbox
```

### 5️⃣ Setup Environment Variables untuk Termux
```bash
# Setup environment untuk puppeteer
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
export PUPPETEER_EXECUTABLE_PATH=`which chromium-browser`

# Tambahkan ke .bashrc agar permanent
echo 'export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true' >> ~/.bashrc
echo 'export PUPPETEER_EXECUTABLE_PATH=`which chromium-browser`' >> ~/.bashrc
```

### 6️⃣ Buat File index.js
```bash
# Buat file index.js dan copy code dari artifacts
nano index.js

# Paste code dari artifacts, lalu save dengan Ctrl+X, Y, Enter
```

### 7️⃣ Jalankan Bot
```bash
# Jalankan bot
npm start

# Atau langsung dengan node
node index.js
```

---

## 🎯 CARA PENGGUNAAN

### 1️⃣ Menjalankan Bot
```bash
# Windows PowerShell
npm start

# Termux
npm start
```

### 2️⃣ Menu Navigasi
1. **Koneksi WhatsApp** - Hubungkan bot ke WhatsApp
2. **Buat Grup Otomatis** - Mulai membuat grup
3. **Status Bot** - Lihat status koneksi
4. **Keluar** - Keluar dari aplikasi

### 3️⃣ Proses Pembuatan Grup
1. Masukkan nama grup
2. Masukkan nomor yang ingin diinvite (pisahkan dengan koma)
3. Pilih jumlah grup (1-50)
4. Konfirmasi pembuatan
5. Bot akan membuat grup otomatis dengan format:
   ```
   [Nama] / [Tanggal] - [Urutan]
   Contoh: SCGW / 13 - 01
   ```

---

## 📁 STRUKTUR PROJECT

```
SCGW-Bot/
├── index.js              # File utama bot
├── package.json          # Dependencies configuration
├── img/                  # Folder untuk foto profil grup
│   └── profil_grub.png   # Foto profil grup default
├── .wwebjs_auth/         # Folder auth WhatsApp (auto-generated)
└── node_modules/         # Dependencies (auto-generated)
```

---

## 🔧 TROUBLESHOOTING

### Error: "Cannot find module 'whatsapp-web.js'"
```bash
npm install whatsapp-web.js@1.23.0
```

### Error: "Puppeteer download failed"
```bash
# Windows
npm install puppeteer --ignore-scripts

# Termux
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
npm install puppeteer
```

### Error: "Authentication failed"
```bash
# Hapus folder auth dan coba lagi
rm -rf .wwebjs_auth/
```

### Error: "Port already in use"
```bash
# Kill semua proses node
# Windows
taskkill /f /im node.exe

# Termux
pkill node
```

---

## 📝 CATATAN PENTING

1. **Autentikasi**: Bot ini menggunakan autentikasi nomor HP, bukan QR Code
2. **Rate Limit**: WhatsApp memiliki rate limit, jangan buat terlalu banyak grup sekaligus
3. **Foto Profil**: Letakkan foto profil grup di `img/profil_grub.png`
4. **Backup**: Backup folder `.wwebjs_auth` untuk menghindari login ulang
5. **Legal**: Gunakan bot ini sesuai dengan Terms of Service WhatsApp

---

## 🤝 SUPPORT

Jika mengalami masalah:
1. Pastikan semua dependencies terinstall
2. Periksa koneksi internet
3. Restart bot jika ada error
4. Hubungi developer: @alfathaannn

---

## 📄 LICENSE

MIT License - Free to use and modify

---

**🚀 Developed by @alfathaannn**
**Saint Create Group WhatsApp (SCGW) Bot v1.0**