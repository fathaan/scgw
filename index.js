const { Client, LocalAuth } = require('whatsapp-web.js');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const chalk = require('chalk');
const figlet = require('figlet');
const ora = require('ora');
const gradient = require('gradient-string');
const qrcode = require('qrcode-terminal');

class SCGWBot {
    constructor() {
        this.client = null;
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        this.isReady = false;
        this.connectedNumber = null;
    }

    // Banner ASCII Art
    showBanner() {
        console.clear();
        const banner = figlet.textSync('SAINT  BOT', {
            font: 'bloody',
            horizontalLayout: 'default',
            verticalLayout: 'default'
        });
        
        console.log(chalk.cyan.bold(banner));
        console.log(chalk.cyan.bold('by @alfathaannn\n'));
        console.log(chalk.yellow('═'.repeat(80)));
        console.log(gradient.instagram('🚀 SAINT CREATE GROUP WHATSAPP (SCGW) BOT 🚀'));
        console.log(chalk.yellow('═'.repeat(80)));
        
        // Show status information here
        console.log(chalk.blue.bold('\n📊 INFORMASI BOT:'));
        console.log(chalk.yellow('─'.repeat(40)));
        console.log(chalk.white(`🔗 Status WhatsApp: ${this.isReady ? chalk.green.bold('TERHUBUNG') : chalk.red.bold('TIDAK TERHUBUNG')}`));
        if (this.isReady && this.connectedNumber) {
            console.log(chalk.white(`📱 Nomor Terhubung: ${chalk.cyan.bold(this.connectedNumber)}`));
        }
        console.log(chalk.white(`📅 Versi: ${chalk.magenta.bold('SCGW v1.0')}`));
        console.log(chalk.white(`👤 Developer: ${chalk.cyan.bold('@alfathaannn')}`));
        console.log(chalk.yellow('─'.repeat(40)));
        console.log();
    }

    // Menu Navigation
    showMenu() {
        console.log(chalk.magenta.bold('\n📋 MENU NAVIGASI:'));
        console.log(chalk.cyan('1. 🔗 Hubungkan WhatsApp'));
        console.log(chalk.cyan('2. 📱 Buat Grup Otomatis'));
        console.log(chalk.cyan('3. 🔐 Logout WhatsApp'));
        console.log(chalk.cyan('4. 🚪 Matikan BOT'));
        console.log(chalk.yellow('-'.repeat(40)));
    }

    // Loading Animation
    showLoadingAnimation(message) {
        const spinner = ora({
            text: message,
            spinner: 'dots12',
            color: 'cyan'
        }).start();
        return spinner;
    }

    // Input dengan prompt yang styled
    async askQuestion(question) {
        return new Promise((resolve) => {
            this.rl.question(chalk.yellow(`❓ ${question}: `), (answer) => {
                resolve(answer.trim());
            });
        });
    }

    // Konfirmasi Yes/No
    async confirmAction(message) {
        const answer = await this.askQuestion(`${message} (y/n)`);
        return answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes';
    }

    // Inisialisasi WhatsApp Client dengan Phone Number
    async initializeWhatsApp() {
        try {
            console.log(chalk.blue.bold('\n🔧 Menginisialisasi WhatsApp Client...'));
            
            const spinner = this.showLoadingAnimation('Menghubungkan ke WhatsApp...');

            this.client = new Client({
                authStrategy: new LocalAuth(),
                puppeteer: {
                    headless: true,
                    args: ['--no-sandbox', '--disable-setuid-sandbox']
                },
                webVersionCache: {
                    type: 'remote',
                    remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html'
                }
            });

            // Event handler QR Code
            this.client.on('qr', (qr) => {
                spinner.stop();
                console.log(chalk.green.bold('\n📡 Scan QR Code berikut untuk login:'));
                qrcode.generate(qr, { small: true });
                console.log(chalk.yellow('\n⚠️ Harap scan dalam waktu 30 detik!'));
            });

            this.client.on('ready', async () => {
                spinner.stop();
                console.log(chalk.green.bold('\n✅ WhatsApp terhubung dengan sukses!'));
                this.isReady = true;
                
                // Dapatkan nomor yang terhubung dengan cara yang lebih reliable
                try {
                    const info = this.client.info;
                    if (info && info.wid && info.wid.user) {
                        this.connectedNumber = info.wid.user;
                        console.log(chalk.cyan.bold(`📱 Nomor terhubung: ${this.connectedNumber}`));
                    } else {
                        // Fallback method
                        const me = await this.client.getMe();
                        this.connectedNumber = me.number || me.user || 'Tidak diketahui';
                        console.log(chalk.cyan.bold(`📱 Nomor terhubung: ${this.connectedNumber}`));
                    }
                } catch (error) {
                    console.log(chalk.yellow('⚠️ Gagal mendapatkan nomor WhatsApp'));
                    this.connectedNumber = 'Tidak diketahui';
                }
            });

            this.client.on('auth_failure', (msg) => {
                spinner.stop();
                console.log(chalk.red.bold('\n❌ Autentikasi gagal!'));
                console.log(chalk.yellow(`Pesan error: ${msg}`));
                this.isReady = false;
            });

            this.client.on('disconnected', (reason) => {
                console.log(chalk.red.bold('\n📡 WhatsApp terputus!'));
                console.log(chalk.yellow(`Alasan: ${reason}`));
                this.isReady = false;
                this.connectedNumber = null;
            });

            await this.client.initialize();
            
        } catch (error) {
            console.log(chalk.red.bold('\n❌ Error saat menginisialisasi WhatsApp:'));
            console.log(chalk.red(error.message));
        }
    }

    // Fungsi untuk membuat grup otomatis
    async createGroupsAutomatically() {
        if (!this.isReady) {
            console.log(chalk.red.bold('\n❌ WhatsApp belum terhubung!'));
            return;
        }

        try {
            console.log(chalk.blue.bold('\n📱 BUAT GRUP OTOMATIS'));
            console.log(chalk.yellow('-'.repeat(40)));

            // Input data grup
            const groupName = await this.askQuestion('Masukkan nama grup');
            const phoneNumbers = await this.askQuestion('Masukkan nomor yang ingin diinvite (pisahkan dengan koma)');
            const groupCount = parseInt(await this.askQuestion('Jumlah grup yang ingin dibuat (1-50)'));

            // Validasi input
            if (!groupName || !phoneNumbers || groupCount < 1 || groupCount > 50) {
                throw new Error('Input tidak valid!');
            }

            // Parse nomor telepon
            const numbers = phoneNumbers.split(',').map(num => num.trim());
            const currentDate = new Date().getDate().toString().padStart(2, '0');

            // Konfirmasi
            console.log(chalk.cyan.bold('\n📋 RINGKASAN PEMBUATAN GRUP:'));
            console.log(chalk.white(`📝 Nama Grup: ${groupName}`));
            console.log(chalk.white(`📊 Jumlah Grup: ${groupCount}`));
            console.log(chalk.white(`👥 Nomor yang diinvite: ${numbers.join(', ')}`));
            console.log(chalk.white(`📅 Tanggal: ${currentDate}`));

            const confirm = await this.confirmAction('\nLanjutkan pembuatan grup?');
            if (!confirm) {
                console.log(chalk.yellow('❌ Pembuatan grup dibatalkan.'));
                return;
            }

            // Mulai pembuatan grup
            const spinner = this.showLoadingAnimation('Membuat grup...');
            const results = [];

            for (let i = 1; i <= groupCount; i++) {
                try {
                    const groupTitle = `${groupName} ${i.toString().padStart(2, '0')}`;
                    
                    // Buat grup dengan nomor yang diinvite
                    const participantIds = numbers.map(num => `${num}@c.us`);
                    const group = await this.client.createGroup(groupTitle, participantIds);

                    // Set foto profil
                    // const imgPath = path.join(process.cwd(), 'img', 'profil_grub.jpg');
                    // if (fs.existsSync(imgPath)) {
                    //     try {
                    //         const { MessageMedia } = require('whatsapp-web.js');
                    //         const media = MessageMedia.fromFilePath(imgPath);
                    //         await this.client.setGroupIcon(group.gid._serialized, media);
                    //     } catch (imgError) {
                    //         console.log(chalk.yellow(`⚠️ Gagal set foto profil: ${imgError.message}`));
                    //     }
                    // }

                    // Kick member
                    await this.sleep(2000);
                    try {
                        const chat = await this.client.getChatById(group.gid._serialized);
                        await chat.removeParticipants(participantIds);
                    } catch (kickError) {
                        console.log(chalk.yellow(`⚠️ Gagal kick members: ${kickError.message}`));
                    }

                    results.push({
                        success: true,
                        name: groupTitle,
                        id: group.gid._serialized
                    });

                    spinner.text = `Membuat grup ${i}/${groupCount}...`;
                    await this.sleep(1000); // Delay untuk menghindari spam

                } catch (error) {
                    results.push({
                        success: false,
                        name: `${groupName} - ${i.toString().padStart(2, '0')}`,
                        error: error.message
                    });
                }
            }

            spinner.stop();

           // Tampilkan hasil
           console.log(chalk.green.bold('\n✅ HASIL PEMBUATAN GRUP:'));
           console.log(chalk.yellow('═'.repeat(60)));

           const successful = results.filter(r => r.success);
           const failed = results.filter(r => !r.success);

           console.log(chalk.green.bold(`✅ Berhasil: ${successful.length} grup`));
           successful.forEach((result, index) => {
               console.log(chalk.green(`   ${index + 1}. ${result.name}`));
           });

           if (failed.length > 0) {
               console.log(chalk.red.bold(`\n❌ Gagal: ${failed.length} grup`));
               failed.forEach((result, index) => {
                   console.log(chalk.red(`   ${index + 1}. ${result.name} - ${result.error}`));
               });
           }

           console.log(chalk.yellow('═'.repeat(60)));
           console.log(chalk.blue.bold(`📊 Total: ${results.length} grup diproses`));

           // Simpan history
           await this.saveGroupHistory(results);

       } catch (error) {
            console.log(chalk.red.bold('\n❌ Error saat membuat grup:'));
            console.log(chalk.red(error.message));
        }
    }

    // Fungsi untuk menghapus folder .wwebjs_auth
    async deleteAuthFolder() {
        try {
            const authPath = path.join(process.cwd(), '.wwebjs_auth');
            if (fs.existsSync(authPath)) {
                // Hapus folder secara rekursif
                fs.rmSync(authPath, { recursive: true, force: true });
                console.log(chalk.green.bold('✅ Folder .wwebjs_auth berhasil dihapus'));
            } else {
                console.log(chalk.yellow('⚠️ Folder .wwebjs_auth tidak ditemukan'));
            }
        } catch (error) {
            console.log(chalk.red.bold('❌ Gagal menghapus folder .wwebjs_auth:'));
            console.log(chalk.red(error.message));
        }
    }

    // Logout Whatsapp dengan menghapus folder auth
    async logoutWhatsApp() {
        if (!this.isReady) {
            console.log(chalk.red.bold('\n❌ WhatsApp belum terhubung!'));
            return;
        }
    
        try {
            const confirm = await this.confirmAction('Yakin ingin logout dari WhatsApp?');
            if (!confirm) {
                console.log(chalk.yellow('❌ Logout dibatalkan.'));
                return;
            }
    
            const spinner = this.showLoadingAnimation('Melakukan logout...');
            
            // Proses logout yang lebih lengkap
            if (this.client) {
                try {
                    // Logout dari WhatsApp Web
                    await this.client.logout();
                    console.log(chalk.green('✅ Logout dari WhatsApp berhasil'));
                } catch (logoutError) {
                    console.log(chalk.yellow(`⚠️ Warning logout: ${logoutError.message}`));
                }
                
                try {
                    // Destroy client
                    await this.client.destroy();
                    console.log(chalk.green('✅ Client destroyed'));
                } catch (destroyError) {
                    console.log(chalk.yellow(`⚠️ Warning destroy: ${destroyError.message}`));
                }
            }
            
            // Reset state
            this.client = null;
            this.isReady = false;
            this.connectedNumber = null;
            
            spinner.stop();
            
            // Hapus folder auth
            await this.deleteAuthFolder();
            
            console.log(chalk.green.bold('\n✅ Berhasil logout dari WhatsApp dan menghapus data autentikasi!'));
            
        } catch (error) {
            console.log(chalk.red.bold('\n❌ Gagal logout:'));
            console.log(chalk.red(error.message));
            
            // Tetap reset state meskipun ada error
            this.client = null;
            this.isReady = false;
            this.connectedNumber = null;
            
            // Tetap coba hapus folder auth
            await this.deleteAuthFolder();
        }
    }
    // Fungsi untuk menyimpan history grup ke file
    async saveGroupHistory(groups) {
        try {
            const historyDir = path.join(process.cwd(), 'history');
            if (!fs.existsSync(historyDir)) {
                fs.mkdirSync(historyDir);
            }

            const now = new Date();
            const dateStr = now.toISOString().split('T')[0];
            const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
            const filename = `group_history_${dateStr}_${timeStr}.txt`;
            const filePath = path.join(historyDir, filename);

            let content = '📋 SAINT CREATE GROUP WHATSAPP BOT - GROUP CREATION HISTORY\n';
            content += '═'.repeat(60) + '\n';
            content += `📅 Tanggal Pembuatan: ${now.toLocaleString()}\n`;
            content += `👤 Developer: @alfathaannn\n`;
            content += '═'.repeat(60) + '\n\n';
            content += '📊 DAFTAR GRUP YANG DIBUAT:\n';
            content += '─'.repeat(40) + '\n';

            groups.forEach((group, index) => {
                content += `🔹 ${index + 1}. ${group.name}\n`;
                content += `   - Status: ${group.success ? '✅ Berhasil' : '❌ Gagal'}\n`;
                if (group.success) {
                    content += `   - Group ID: ${group.id}\n`;
                } else {
                    content += `   - Error: ${group.error}\n`;
                }
                content += '─'.repeat(40) + '\n';
            });

            fs.writeFileSync(filePath, content);
            console.log(chalk.green.bold(`\n📝 History grup disimpan di: ${filePath}`));

        } catch (error) {
            console.log(chalk.yellow(`⚠️ Gagal menyimpan history: ${error.message}`));
        }
    }

    // Status Bot
    showStatus() {
        console.log(chalk.blue.bold('\n📊 STATUS BOT:'));
        console.log(chalk.yellow('-'.repeat(30)));
        console.log(chalk.white(`🔗 Status: ${this.isReady ? chalk.green('Terhubung') : chalk.red('Tidak terhubung')}`));
        console.log(chalk.white(`🤖 Bot: SCGW v1.0`));
        console.log(chalk.white(`👤 Developer: @alfathaannn`));
    }

    // Helper function untuk delay
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Main menu loop
    async run() {
        while (true) {
            this.showBanner();
            this.showMenu();
    
            const choice = await this.askQuestion('Pilih menu (1-4)');
    
            switch (choice) {
                case '1':
                    await this.initializeWhatsApp();
                    await this.askQuestion('Tekan Enter untuk melanjutkan');
                    break;
                case '2':
                    await this.createGroupsAutomatically();
                    await this.askQuestion('Tekan Enter untuk melanjutkan');
                    break;
                case '3':
                    await this.logoutWhatsApp();
                    await this.askQuestion('Tekan Enter untuk melanjutkan');
                    break;
                case '4':
                    console.log(chalk.green.bold('\n👋 Terima kasih telah menggunakan SCGW Bot!'));
                    console.log(chalk.cyan('🚀 Developed by @alfathaannn'));
                    if (this.client) {
                        await this.client.destroy();
                    }
                    this.rl.close();
                    process.exit(0);
                    break;
                default:
                    console.log(chalk.red.bold('\n❌ Pilihan tidak valid!'));
                    await this.askQuestion('Tekan Enter untuk melanjutkan');
                    break;
            }
        }
    }
}

// Jalankan bot
const bot = new SCGWBot();
bot.run().catch(console.error);

// Handle exit
process.on('SIGINT', async () => {
    console.log(chalk.yellow.bold('\n\n🛑 Menghentikan bot...'));
    if (bot.client) {
        await bot.client.destroy();
    }
    process.exit(0);
});