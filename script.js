// Data Interval Standar Pabrikan untuk Motor Matic Bongsor (PCX, ADV, NMAX, dll)
const defaultComponents = [
    { id: 'oli_mesin', name: 'Oli Mesin', interval: 3000, lastReplacedKm: 0, icon: 'fa-oil-can' },
    { id: 'oli_gardan', name: 'Oli Gardan / Transmisi', interval: 8000, lastReplacedKm: 0, icon: 'fa-gears' },
    { id: 'busi', name: 'Busi', interval: 8000, lastReplacedKm: 0, icon: 'fa-bolt' },
    { id: 'roller_slider', name: 'Roller & Slider CVT', interval: 12000, lastReplacedKm: 0, icon: 'fa-circle-dot' },
    { id: 'filter_udara', name: 'Filter Udara', interval: 12000, lastReplacedKm: 0, icon: 'fa-wind' },
    { id: 'kampas_rem', name: 'Kampas Rem (Depan/Belakang)', interval: 15000, lastReplacedKm: 0, icon: 'fa-shield-halved' },
    { id: 'minyak_rem', name: 'Minyak Rem', interval: 20000, lastReplacedKm: 0, icon: 'fa-bottle-droplet' },
    { id: 'vbelt', name: 'V-Belt CVT', interval: 24000, lastReplacedKm: 0, icon: 'fa-infinity' }
];

// State Variabel Aplikasi
let currentOdo = 0;
let components = [];
let historyLogs = [];

// Inisialisasi saat aplikasi pertama kali dimuat
function initApp() {
    const savedOdo = localStorage.getItem('moto_currentOdo');
    currentOdo = savedOdo ? parseInt(savedOdo, 10) : 0;

    const savedComponents = localStorage.getItem('moto_components');
    components = savedComponents ? JSON.parse(savedComponents) : defaultComponents;

    const savedHistory = localStorage.getItem('moto_history');
    historyLogs = savedHistory ? JSON.parse(savedHistory) : [];

    document.getElementById('currentOdoInput').value = currentOdo;
    render();
}

// Simpan state ke LocalStorage
function saveData() {
    localStorage.setItem('moto_currentOdo', currentOdo);
    localStorage.setItem('moto_components', JSON.stringify(components));
    localStorage.setItem('moto_history', JSON.stringify(historyLogs));
}

// Perbarui Odometer Utama
function updateOdometer() {
    const inputVal = document.getElementById('currentOdoInput').value;
    const newOdo = parseInt(inputVal, 10);

    if (isNaN(newOdo) || newOdo < 0) {
        showToast('Masukkan KM Odometer yang valid!', 'error');
        return;
    }

    currentOdo = newOdo;
    saveData();
    render();
    showToast('Odometer berhasil diperbarui!');
}

// Format Angka Ribuan
function formatKM(num) {
    return num.toLocaleString('id-ID');
}

// Render Seluruh Komponen Utama
function render() {
    // 1. Render Summary Odo
    document.getElementById('summaryOdo').innerHTML = `${formatKM(currentOdo)} <small>KM</small>`;

    let countGood = 0;
    let countWarning = 0;
    let countDanger = 0;

    const container = document.getElementById('componentsContainer');
    container.innerHTML = '';

    // 2. Render Kartu Komponen
    components.forEach(comp => {
        const distanceUsed = Math.max(0, currentOdo - comp.lastReplacedKm);
        const remainingKm = comp.interval - distanceUsed;
        
        let usedPercentage = Math.min(100, Math.max(0, Math.round((distanceUsed / comp.interval) * 100)));
        let healthPercentage = 100 - usedPercentage;

        let badgeHtml = '';
        let fillClass = '';
        let cardBorder = '';

        // Klasifikasi Status (Hijau, Kuning, Merah)
        if (remainingKm <= 0) {
            countDanger++;
            badgeHtml = `<span class="badge badge-red">Wajib Ganti</span>`;
            fillClass = 'fill-red';
            cardBorder = 'border-danger';
        } else if (remainingKm <= comp.interval * 0.25) { // Sisa 25% atau kurang
            countWarning++;
            badgeHtml = `<span class="badge badge-amber">Persiapan</span>`;
            fillClass = 'fill-amber';
        } else {
            countGood++;
            badgeHtml = `<span class="badge badge-green">Aman</span>`;
            fillClass = 'fill-green';
        }

        const card = document.createElement('div');
        card.className = `comp-card ${cardBorder}`;
        card.innerHTML = `
            <div>
                <div class="comp-header">
                    <div class="comp-info">
                        <div class="comp-icon">
                            <i class="fa-solid ${comp.icon}"></i>
                        </div>
                        <div>
                            <h4 class="comp-name">${comp.name}</h4>
                            <span class="comp-interval">Interval: ${formatKM(comp.interval)} KM</span>
                        </div>
                    </div>
                    ${badgeHtml}
                </div>

                <div class="progress-container">
                    <div class="progress-info">
                        <span>Kesehatan Part</span>
                        <span class="font-bold">${healthPercentage}%</span>
                    </div>
                    <div class="progress-bg">
                        <div class="progress-fill ${fillClass}" style="width: ${healthPercentage}%"></div>
                    </div>
                </div>

                <div class="comp-footer-stats">
                    <div>
                        <span class="stat-sublabel">KM Terakhir Ganti</span>
                        <span class="stat-subvalue">${formatKM(comp.lastReplacedKm)} KM</span>
                    </div>
                    <div style="text-align: right;">
                        <span class="stat-sublabel">Sisa Jarak</span>
                        <span class="stat-subvalue ${remainingKm <= 0 ? 'text-red' : 'text-green'}">
                            ${remainingKm <= 0 ? 'Lewat ' + formatKM(Math.abs(remainingKm)) : formatKM(remainingKm)} KM
                        </span>
                    </div>
                </div>
            </div>

            <button onclick="openServiceModal('${comp.id}')" class="btn btn-action">
                <i class="fa-solid fa-arrows-rotate"></i> Catat Penggantian
            </button>
        `;
        container.appendChild(card);
    });

    // 3. Render Top Stats Counter
    document.getElementById('summaryGood').innerHTML = `${countGood} <small>Part</small>`;
    document.getElementById('summaryWarning').innerHTML = `${countWarning} <small>Part</small>`;
    document.getElementById('summaryDanger').innerHTML = `${countDanger} <small>Part</small>`;

    // 4. Render Table History
    renderHistoryTable();
}

// Render Tabel Riwayat
function renderHistoryTable() {
    const tableBody = document.getElementById('historyTableBody');
    tableBody.innerHTML = '';

    if (historyLogs.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; color: var(--text-muted); padding: 30px;">
                    Belum ada riwayat penggantian part yang dicatat.
                </td>
            </tr>
        `;
        return;
    }

    historyLogs.slice().reverse().forEach(log => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="color: var(--text-muted);">${log.date}</td>
            <td style="font-weight: 700;">${log.partName}</td>
            <td style="color: var(--primary-blue); font-weight: 600;">${formatKM(log.km)} KM</td>
            <td style="color: var(--text-muted); font-size: 0.8rem;">${log.notes || '-'}</td>
        `;
        tableBody.appendChild(tr);
    });
}

// Buka Modal Input Servis
function openServiceModal(partId) {
    const comp = components.find(c => c.id === partId);
    if (!comp) return;

    document.getElementById('modalPartId').value = comp.id;
    document.getElementById('modalPartName').value = comp.name;
    document.getElementById('modalPartKm').value = currentOdo;
    document.getElementById('modalNotes').value = '';

    document.getElementById('serviceModal').classList.add('active');
}

// Tutup Modal
function closeServiceModal() {
    document.getElementById('serviceModal').classList.remove('active');
}

// Handle Submit Modal Servis
function handleServiceSubmit(event) {
    event.preventDefault();

    const partId = document.getElementById('modalPartId').value;
    const kmVal = parseInt(document.getElementById('modalPartKm').value, 10);
    const notes = document.getElementById('modalNotes').value.trim();

    if (isNaN(kmVal) || kmVal < 0) {
        showToast('KM penggantian tidak valid!', 'error');
        return;
    }

    const compIndex = components.findIndex(c => c.id === partId);
    if (compIndex !== -1) {
        components[compIndex].lastReplacedKm = kmVal;

        const now = new Date();
        const formattedDate = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
        
        historyLogs.push({
            date: formattedDate,
            partName: components[compIndex].name,
            km: kmVal,
            notes: notes
        });

        // Update Odometer jika input KM servis lebih tinggi dari KM saat ini
        if (kmVal > currentOdo) {
            currentOdo = kmVal;
            document.getElementById('currentOdoInput').value = currentOdo;
        }

        saveData();
        render();
        closeServiceModal();
        showToast(`Status ${components[compIndex].name} berhasil diperbarui!`);
    }
}

// Hapus Seluruh Riwayat
function clearHistory() {
    if (confirm('Apakah Anda yakin ingin menghapus seluruh riwayat servis?')) {
        historyLogs = [];
        saveData();
        renderHistoryTable();
        showToast('Riwayat servis telah dibersihkan.');
    }
}

// Custom Toast Notification (Pengganti alert)
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast';
    
    toast.innerHTML = `
        <i class="fa-solid ${type === 'error' ? 'fa-circle-xmark' : 'fa-circle-check'} toast-icon"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Jalankan aplikasi saat window loaded
window.onload = function() {
    initApp();
};