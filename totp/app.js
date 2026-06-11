class TOTP {
    static generate(secret, timeStep = 30) {
        const key = TOTP.base32ToBytes(secret.replace(/\s/g, '').toUpperCase());
        const time = Math.floor(Date.now() / 1000 / timeStep);
        
        const hmac = new jsSHA('SHA-1', 'UINT8ARRAY');
        hmac.setHMACKey(key, 'UINT8ARRAY');
        hmac.update(TOTP.intToBytes(time));
        const hash = hmac.getHMAC('UINT8ARRAY');
        
        const offset = hash[hash.length - 1] & 0x0f;
        const binary = ((hash[offset] & 0x7f) << 24) |
                       ((hash[offset + 1] & 0xff) << 16) |
                       ((hash[offset + 2] & 0xff) << 8) |
                       (hash[offset + 3] & 0xff);
        
        const otp = binary % 1000000;
        return otp.toString().padStart(6, '0');
    }

    static base32ToBytes(base32) {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        base32 = base32.replace(/=+$/, '');
        const bytes = [];
        let bits = 0;
        let value = 0;
        
        for (let i = 0; i < base32.length; i++) {
            const index = alphabet.indexOf(base32[i]);
            if (index === -1) continue;
            value = (value << 5) | index;
            bits += 5;
            if (bits >= 8) {
                bytes.push((value >>> (bits - 8)) & 0xff);
                bits -= 8;
            }
        }
        return new Uint8Array(bytes);
    }

    static intToBytes(num) {
        const bytes = new Uint8Array(8);
        for (let i = 7; i >= 0; i--) {
            bytes[i] = num & 0xff;
            num >>>= 8;
        }
        return bytes;
    }

    static getTimeRemaining() {
        return 30 - (Math.floor(Date.now() / 1000) % 30);
    }
}

class TOTPApp {
    constructor() {
        this.accounts = JSON.parse(localStorage.getItem('totp_accounts') || '[]');
        this.addBtn = document.getElementById('addBtn');
        this.pasteBtn = document.getElementById('pasteBtn');
        this.accountsList = document.getElementById('accountsList');
        
        this.addBtn.addEventListener('click', () => this.addAccount());
        this.pasteBtn.addEventListener('click', () => this.pasteSecret());
        
        this.render();
        setInterval(() => this.updateCodes(), 1000);
    }

    pasteSecret() {
        navigator.clipboard.readText().then(text => {
            document.getElementById('secretKey').value = text.trim();
        });
    }

    addAccount() {
        const keyInput = document.getElementById('secretKey');
        const secret = keyInput.value.trim();
        
        if (!secret) {
            alert('Please enter secret key');
            return;
        }
        
        this.accounts.push({ secret });
        this.save();
        this.render();
        
        keyInput.value = '';
    }

    deleteAccount(index) {
        this.accounts.splice(index, 1);
        this.save();
        this.render();
    }

    save() {
        localStorage.setItem('totp_accounts', JSON.stringify(this.accounts));
    }

    render() {
        this.accountsList.innerHTML = [...this.accounts].reverse().map((acc, i) => {
            const realIndex = this.accounts.length - 1 - i;
            return `
            <div class="account-card" data-index="${realIndex}">
                <div class="account-info">
                    <span class="account-secret">${acc.secret.substring(0, 8)}...</span>
                </div>
                <div class="totp-display">
                    <div class="timer">
                        <span class="code" data-secret="${acc.secret}">${TOTP.generate(acc.secret)}</span>
                        <span class="countdown">${TOTP.getTimeRemaining()}s</span>
                    </div>
                    <button class="copy-btn" onclick="app.copyCode('${acc.secret}', this)">Copy</button>
                    <button class="delete-btn" onclick="app.deleteAccount(${realIndex})">×</button>
                </div>
            </div>
        `}).join('');
    }

    updateCodes() {
        const codes = document.querySelectorAll('.code');
        const countdowns = document.querySelectorAll('.countdown');
        
        codes.forEach((el) => {
            el.textContent = TOTP.generate(el.dataset.secret);
        });
        
        countdowns.forEach(el => {
            el.textContent = TOTP.getTimeRemaining() + 's';
        });
    }

    copyCode(secret, btn) {
        const code = TOTP.generate(secret);
        navigator.clipboard.writeText(code).then(() => {
            btn.textContent = 'Copied!';
            btn.classList.add('copied');
            setTimeout(() => {
                btn.textContent = 'Copy';
                btn.classList.remove('copied');
            }, 1500);
        });
    }
}

const app = new TOTPApp();