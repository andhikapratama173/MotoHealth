// Default Components Data
const defaultComponents = [
  { id: '1', name: 'Oli Mesin', interval: 3000, lastChangedKm: 0 },
  { id: '2', name: 'Oli Gardan', interval: 8000, lastChangedKm: 0 },
  { id: '3', name: 'Roller CVT', interval: 12000, lastChangedKm: 0 },
  { id: '4', name: 'V-Belt', interval: 24000, lastChangedKm: 0 },
  { id: '5', name: 'Busi', interval: 8000, lastChangedKm: 0 },
  { id: '6', name: 'Filter Udara', interval: 16000, lastChangedKm: 0 }
];

// App State
let odometer = parseInt(localStorage.getItem('moto_odo')) || 0;
let components = JSON.parse(localStorage.getItem('moto_components')) || defaultComponents;
let history = JSON.parse(localStorage.getItem('moto_history')) || [];

// DOM Elements
const currentOdoInput = document.getElementById('current-odometer');
const btnUpdateOdo = document.getElementById('btn-update-odo');
const componentContainer = document.getElementById('component-container');
const historyList = document.getElementById('history-list');

// Modal Elements
const modalAdd = document.getElementById('modal-add-component');
const modalService = document.getElementById('modal-service');
const btnOpenAdd = document.getElementById('btn-open-add-modal');
const btnOpenService = document.getElementById('btn-open-service-modal');
const serviceCompSelect = document.getElementById('service-comp-select');

// Initial Load
currentOdoInput.value = odometer;
renderComponents();
renderHistory();

// Update Odometer Event
btnUpdateOdo.addEventListener('click', () => {
  const val = parseInt(currentOdoInput.value);
  if (!isNaN(val) && val >= 0) {
    odometer = val;
    localStorage.setItem('moto_odo', odometer);
    renderComponents();
  }
});

// Render Components Card List
function renderComponents() {
  componentContainer.innerHTML = '';
  
  components.forEach(comp => {
    const kmUsed = odometer - comp.lastChangedKm;
    const kmRemaining = comp.interval - kmUsed;
    const percentage = Math.max(0, Math.min(100, Math.round(((comp.interval - kmUsed) / comp.interval) * 100)));
    
    // Status color selection
    let statusBg = 'bg-emerald-500';
    let statusText = 'Sangat Baik';
    let badgeBg = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';

    if (kmRemaining <= 0) {
      statusBg = 'bg-red-500';
      statusText = 'Wajib Ganti!';
      badgeBg = 'bg-red-500/10 text-red-400 border-red-500/20';
    } else if (percentage <= 25) {
      statusBg = 'bg-amber-500';
      statusText = 'Segera Ganti';
      badgeBg = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }

    const card = document.createElement('div');
    card.className = 'bg-gray-800 p-5 rounded-xl border border-gray-700 flex flex-col justify-between relative';
    card.innerHTML = `
      <div>
        <div class="flex justify-between items-start mb-3">
          <div>
            <h3 class="font-bold text-lg text-white">${comp.name}</h3>
            <span class="text-xs text-gray-400">Interval: tiap ${comp.interval.toLocaleString('id-ID')} KM</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeBg}">${statusText}</span>
            <button onclick="deleteComponent('${comp.id}')" class="text-gray-500 hover:text-red-400 text-xs p-1" title="Hapus Komponen">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
        
        <div class="mb-3">
          <div class="flex justify-between text-xs font-semibold mb-1">
            <span class="text-gray-400">Sisa Umur</span>
            <span class="${kmRemaining <= 0 ? 'text-red-400 font-bold' : 'text-gray-200'}">
              ${kmRemaining <= 0 ? 'Melewati batas ' + Math.abs(kmRemaining).toLocaleString('id-ID') + ' KM' : kmRemaining.toLocaleString('id-ID') + ' KM lagi'}
            </span>
          </div>
          <div class="w-full bg-gray-900 rounded-full h-2.5 overflow-hidden">
            <div class="${statusBg} h-2.5 rounded-full transition-all duration-300" style="width: ${percentage}%"></div>
          </div>
        </div>
      </div>

      <div class="text-xs text-gray-400 border-t border-gray-700/50 pt-3 mt-1 flex justify-between">
        <span>Terakhir diganti: <strong>${comp.lastChangedKm.toLocaleString('id-ID')} KM</strong></span>
        <span>Terpakai: <strong>${Math.max(0, kmUsed).toLocaleString('id-ID')} KM</strong></span>
      </div>
    `;
    componentContainer.appendChild(card);
  });
}

// Delete Custom Component
function deleteComponent(id) {
  if (confirm('Yakin ingin menghapus komponen ini dari pemantauan?')) {
    components = components.filter(c => c.id !== id);
    localStorage.setItem('moto_components', JSON.stringify(components));
    renderComponents();
  }
}

// Render Service History Table
function renderHistory() {
  historyList.innerHTML = '';
  if (history.length === 0) {
    historyList.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-gray-500">Belum ada riwayat penggantian.</td></tr>`;
    return;
  }
  
  history.slice().reverse().forEach(item => {
    const row = document.createElement('tr');
    row.className = 'hover:bg-gray-700/30';
    row.innerHTML = `
      <td class="py-3 px-4 text-gray-400">${item.date}</td>
      <td class="py-3 px-4 font-semibold text-white">${item.compName}</td>
      <td class="py-3 px-4">${parseInt(item.km).toLocaleString('id-ID')} KM</td>
      <td class="py-3 px-4 text-gray-400">${item.note || '-'}</td>
    `;
    historyList.appendChild(row);
  });
}

// Modal Control Event Listeners
btnOpenAdd.addEventListener('click', () => modalAdd.classList.replace('hidden', 'flex'));
btnOpenService.addEventListener('click', () => {
  // Populate dropdown options
  serviceCompSelect.innerHTML = components.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  document.getElementById('service-km').value = odometer;
  modalService.classList.replace('hidden', 'flex');
});

document.querySelectorAll('.btn-close-modal').forEach(btn => {
  btn.addEventListener('click', () => {
    modalAdd.classList.replace('flex', 'hidden');
    modalService.classList.replace('flex', 'hidden');
  });
});

// Form Submit: Add New Component
document.getElementById('form-add-component').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('new-comp-name').value;
  const interval = parseInt(document.getElementById('new-comp-interval').value);
  const lastKm = parseInt(document.getElementById('new-comp-last-km').value);

  const newComp = {
    id: Date.now().toString(),
    name: name,
    interval: interval,
    lastChangedKm: lastKm
  };

  components.push(newComp);
  localStorage.setItem('moto_components', JSON.stringify(components));
  renderComponents();
  
  e.target.reset();
  modalAdd.classList.replace('flex', 'hidden');
});

// Form Submit: Record Service Replacement
document.getElementById('form-service').addEventListener('submit', (e) => {
  e.preventDefault();
  const compId = serviceCompSelect.value;
  const km = parseInt(document.getElementById('service-km').value);
  const note = document.getElementById('service-note').value;

  const targetComp = components.find(c => c.id === compId);
  if (targetComp) {
    targetComp.lastChangedKm = km;
    localStorage.setItem('moto_components', JSON.stringify(components));
    
    // Add to history
    const historyItem = {
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      compName: targetComp.name,
      km: km,
      note: note
    };
    history.push(historyItem);
    localStorage.setItem('moto_history', JSON.stringify(history));

    // Auto update current odo if service KM is higher
    if (km > odometer) {
      odometer = km;
      currentOdoInput.value = odometer;
      localStorage.setItem('moto_odo', odometer);
    }

    renderComponents();
    renderHistory();
  }

  e.target.reset();
  modalService.classList.replace('flex', 'hidden');
});
