#!/bin/bash
# Birdmaid Server Hardening Script
# Based on "How To Secure A Linux Server" guide
# This script applies basic security hardening to a Debian 12 server

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "=== Birdmaid Server Hardening ==="
echo ""
echo "This script will apply basic security hardening to your server."
echo "Make sure you have:"
echo "  1. SSH access configured"
echo "  2. A non-root user with sudo privileges"
echo "  3. Backup of important data"
echo ""
read -p "Continue? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Aborted."
    exit 1
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    log_error "Please run as root (use sudo)"
    exit 1
fi

# Backup directory
BACKUP_DIR="/root/birdmaid-hardening-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
log_info "Backups will be saved to: $BACKUP_DIR"

# 1. Update system
log_info "Updating system packages..."
apt update && apt upgrade -y

# 2. Install essential security tools
log_info "Installing security tools..."
apt install -y \
    ufw \
    fail2ban \
    unattended-upgrades \
    apt-listchanges \
    apticron \
    ntp \
    logwatch \
    libpam-pwquality \
    lynis

# 3. Configure UFW Firewall
log_info "Configuring UFW firewall..."

# Backup UFW config
cp -a /etc/ufw /etc/ufw-COPY-$(date +%Y%m%d%H%M%S) 2>/dev/null || true

# Set defaults
ufw default deny incoming
ufw default allow outgoing

# Allow SSH (important: do this first!)
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'

# Allow essential outbound traffic
ufw allow out 53 comment 'DNS'
ufw allow out 123 comment 'NTP'
ufw allow out 80/tcp comment 'HTTP out'
ufw allow out 443/tcp comment 'HTTPS out'

# Enable UFW (but don't activate yet - user will do it manually)
log_warn "UFW rules configured. Run 'ufw enable' manually after verifying SSH access."

# 4. Configure SSH
log_info "Hardening SSH configuration..."

SSH_CONFIG="/etc/ssh/sshd_config"
cp -a "$SSH_CONFIG" "$BACKUP_DIR/sshd_config"

# Remove comments for easier reading
sed -i -r -e '/^#|^$/ d' "$SSH_CONFIG"

# Apply secure SSH settings
cat >> "$SSH_CONFIG" << 'EOF'

########################################################################################################
# Birdmaid SSH Hardening
########################################################################################################

# Use modern key exchange algorithms
KexAlgorithms curve25519-sha256@libssh.org,ecdh-sha2-nistp521,ecdh-sha2-nistp384,ecdh-sha2-nistp256,diffie-hellman-group-exchange-sha256

# Use modern ciphers
Ciphers chacha20-poly1305@openssh.com,aes256-gcm@openssh.com,aes128-gcm@openssh.com,aes256-ctr,aes192-ctr,aes128-ctr

# Use modern MACs
MACs hmac-sha2-512-etm@openssh.com,hmac-sha2-256-etm@openssh.com,hmac-sha2-512,hmac-sha2-256

# Logging
LogLevel VERBOSE

# Security settings
PermitUserEnvironment no
Subsystem sftp internal-sftp -f AUTHPRIV -l INFO
Protocol 2
X11Forwarding no
AllowTcpForwarding no
AllowStreamLocalForwarding no
GatewayPorts no
PermitTunnel no
PermitEmptyPasswords no
IgnoreRhosts yes
UseDNS yes
Compression no
TCPKeepAlive no
AllowAgentForwarding no
PermitRootLogin no
HostbasedAuthentication no
HashKnownHosts yes

# Connection settings
ClientAliveInterval 300
ClientAliveCountMax 0
LoginGraceTime 30
MaxAuthTries 3
MaxSessions 2
MaxStartups 2:30:2

# Password authentication (set to no if using keys only)
# PasswordAuthentication no
EOF

log_info "SSH configuration updated. Review $SSH_CONFIG before restarting SSH."

# 5. Remove short Diffie-Hellman keys
log_info "Removing short Diffie-Hellman keys..."
if [ -f /etc/ssh/moduli ]; then
    cp -a /etc/ssh/moduli "$BACKUP_DIR/moduli"
    awk '$5 >= 3071' /etc/ssh/moduli > /tmp/moduli.tmp
    mv /tmp/moduli.tmp /etc/ssh/moduli
    log_info "Short moduli removed."
fi

# 6. Configure Fail2ban
log_info "Configuring Fail2ban..."

# Create jail.local if it doesn't exist
if [ ! -f /etc/fail2ban/jail.local ]; then
    cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
# IP address range to ignore (add your LAN segment)
ignoreip = 127.0.0.1/8

# Email settings (configure your email)
destemail = root@localhost
sender = root@localhost
mta = mail

# Action
action = %(action_mwl)s
EOF
fi

# Create SSH jail
mkdir -p /etc/fail2ban/jail.d
cat > /etc/fail2ban/jail.d/ssh.local << 'EOF'
[sshd]
enabled = true
banaction = ufw
port = ssh
filter = sshd
logpath = %(sshd_log)s
maxretry = 5
bantime = 3600
findtime = 600
EOF

systemctl enable fail2ban
systemctl restart fail2ban
log_info "Fail2ban configured and started."

# 7. Configure automatic security updates
log_info "Configuring automatic security updates..."

cat > /etc/apt/apt.conf.d/51birdmaid-unattended-upgrades << 'EOF'
// Enable the update/upgrade script
APT::Periodic::Enable "1";

// Do "apt-get update" automatically every day
APT::Periodic::Update-Package-Lists "1";

// Do "apt-get upgrade --download-only" every day
APT::Periodic::Download-Upgradeable-Packages "1";

// Do "apt-get autoclean" every week
APT::Periodic::AutocleanInterval "7";

// Send report mail to root
APT::Periodic::Verbose "2";

// Automatically upgrade packages from these
Unattended-Upgrade::Origins-Pattern {
    "o=Debian,a=stable";
    "o=Debian,a=stable-updates";
    "origin=Debian,codename=${distro_codename},label=Debian-Security";
};

// Package blacklist (add packages you don't want auto-updated)
Unattended-Upgrade::Package-Blacklist {
};

// Auto-fix interrupted dpkg
Unattended-Upgrade::AutoFixInterruptedDpkg "true";

// Install on shutdown (false = install when running)
Unattended-Upgrade::InstallOnShutdown "false";

// Email notifications
Unattended-Upgrade::Mail "root";
Unattended-Upgrade::MailOnlyOnError "false";

// Remove unused dependencies
Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Remove-New-Unused-Dependencies "true";

// Automatic reboot (set to false if you don't want auto-reboot)
Unattended-Upgrade::Automatic-Reboot "false";
Unattended-Upgrade::Automatic-Reboot-WithUsers "false";
EOF

log_info "Automatic security updates configured."

# 8. Configure NTP
log_info "Configuring NTP..."

cp -a /etc/ntp.conf "$BACKUP_DIR/ntp.conf" 2>/dev/null || true

# Use pool instead of specific servers
sed -i -r -e "s/^((server|pool).*)/# \1/" /etc/ntp.conf 2>/dev/null || true
echo "pool pool.ntp.org iburst" >> /etc/ntp.conf

systemctl restart ntp
log_info "NTP configured."

# 9. Configure password quality
log_info "Configuring password quality requirements..."

if [ -f /etc/pam.d/common-password ]; then
    cp -a /etc/pam.d/common-password "$BACKUP_DIR/common-password"
    
    # Update password requirements
    sed -i -r -e "s/^(password\s+requisite\s+pam_pwquality\.so)(.*)$/# \1\2\n\1 retry=3 minlen=10 difok=3 ucredit=-1 lcredit=-1 dcredit=-1 ocredit=-1 maxrepeat=3 gecoschec/" /etc/pam.d/common-password
    log_info "Password quality requirements configured."
fi

# 10. Configure logwatch
log_info "Configuring logwatch..."

if [ -f /etc/cron.daily/00logwatch ]; then
    cp -a /etc/cron.daily/00logwatch "$BACKUP_DIR/00logwatch"
    
    # Configure logwatch to send HTML emails
    sed -i -r -e "s|^($(which logwatch).*?)$|# \1\n$(which logwatch) --output mail --format html --mailto root --range yesterday --service all|" /etc/cron.daily/00logwatch
    log_info "Logwatch configured."
fi

# 11. Secure /proc
log_info "Securing /proc..."

if ! grep -q "hidepid=2" /etc/fstab; then
    cp -a /etc/fstab "$BACKUP_DIR/fstab"
    echo "proc     /proc     proc     defaults,hidepid=2     0     0" >> /etc/fstab
    mount -o remount,hidepid=2 /proc
    log_info "/proc secured. Reboot required for permanent effect."
fi

# 12. Create SSH group for AllowGroups (optional)
log_info "Creating SSH users group..."
if ! getent group sshusers > /dev/null 2>&1; then
    groupadd sshusers
    log_info "Group 'sshusers' created. Add users with: usermod -a -G sshusers <username>"
    log_warn "After adding users, uncomment 'AllowGroups sshusers' in /etc/ssh/sshd_config"
fi

# 13. Summary
echo ""
echo "=== Hardening Complete ==="
echo ""
echo "Backups saved to: $BACKUP_DIR"
echo ""
echo "Next steps:"
echo "  1. Review SSH configuration: /etc/ssh/sshd_config"
echo "  2. Test SSH access from another terminal before restarting SSH"
echo "  3. Restart SSH: systemctl restart sshd"
echo "  4. Enable UFW: ufw enable"
echo "  5. Configure Fail2ban email in: /etc/fail2ban/jail.local"
echo "  6. Configure logwatch email (if needed)"
echo "  7. Add users to sshusers group if using AllowGroups"
echo "  8. Reboot server to apply all changes"
echo ""
echo "Check status:"
echo "  - Fail2ban: fail2ban-client status"
echo "  - UFW: ufw status verbose"
echo "  - SSH: sshd -T | grep -E '(passwordauthentication|permitrootlogin)'"
echo ""
