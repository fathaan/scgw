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
    }

    // Banner ASCII Art
    showBanner() {
        console.clear();
        const banner = figlet.textSync('SAINT  BOT', {
            font: 'bloody',
            horizontalLayout: 'default',
            verticalLayout: 'default'
        });
        
        console.log(chalk.red.bold(banner));
        console.log(chalk.cyan.bold('by @alfathaannn\n'));
        console.log(chalk.yellow('═'.repeat(80)));
        console.log(chalk.green.bold('🚀 SAINT CREATE GROUP WHATSAPP (SCGW) BOT 🚀'));
        console.log(chalk.yellow('═'.repeat(80)));
        console.log();
    }

    // Menu Navigation
    showMenu() {
        console.log(chalk.magenta.bold('\n📋 MENU NAVIGASI:'));
        console.log(chalk.cyan('1. 🔗 Koneksi WhatsApp'));
        console.log(chalk.cyan('2. 📱 Buat Grup Otomatis'));
        console.log(chalk.cyan('3. 📊 Status Bot'));
        console.log(chalk.cyan('4. 🚪 Keluar'));
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

            this.client.on('ready', () => {
                spinner.stop();
                console.log(chalk.green.bold('\n✅ WhatsApp terhubung dengan sukses!'));
                this.isReady = true;
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
                    const groupTitle = `${groupName} / ${currentDate} - ${i.toString().padStart(2, '0')}`;
                    
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
                        name: `${groupName} / ${currentDate} - ${i.toString().padStart(2, '0')}`,
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

        } catch (error) {
            console.log(chalk.red.bold('\n❌ Error saat membuat grup:'));
            console.log(chalk.red(error.message));
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
                    this.showStatus();
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