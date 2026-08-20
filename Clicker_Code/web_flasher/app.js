// Clicker ESP32 Web Flasher Controller

const DEFAULT_RELEASES = [
  { 
    tag: "v1.0.0", 
    version: "1.0.0", 
    name: "Clicker Device Firmware", 
    manifest: "manifest.json", 
    bin: "firmware.bin", 
    factory_bin: "factory_firmware.bin",
    size: 360512, 
    factory_size: 426048,
    is_latest: true 
  }
];

let availableReleases = DEFAULT_RELEASES;
let detectedPathPrefix = '';

document.addEventListener('DOMContentLoaded', async () => {
  checkBrowserCompatibility();
  await detectWorkingReleasePrefix();
  await loadVersionRegistry();
  initVersionSelector();
  renderDownloadsTable();
  initClipboardButtons();
});

function checkBrowserCompatibility() {
  const statusEl = document.getElementById('browser-status');
  const isSerialSupported = 'serial' in navigator;
  const isHttpsOrLocal = window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  if (isSerialSupported && isHttpsOrLocal) {
    statusEl.className = 'browser-status supported';
    statusEl.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
      <span><strong>Web Serial Ready:</strong> Connect your ESP32 via USB and click below to flash.</span>
    `;
  } else if (!isSerialSupported) {
    statusEl.className = 'browser-status unsupported';
    statusEl.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <span><strong>Browser Notice:</strong> Web Serial is not supported in this browser. Use Chrome, Edge, Brave, or see the <a href="#manual-section" style="color:inherit;text-decoration:underline;">manual options below</a>.</span>
    `;
  } else {
    statusEl.className = 'browser-status unsupported';
    statusEl.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
      </svg>
      <span><strong>HTTPS Required:</strong> Web Serial requires HTTPS or localhost to communicate with USB devices.</span>
    `;
  }
}

/**
 * Automatically probe candidate manifest locations to ensure the URL always resolves
 * regardless of whether served from project root or inside web_flasher/.
 */
async function detectWorkingReleasePrefix() {
  const candidates = [
    'manifest.json',
    'releases/v1.0.0/manifest.json',
    '../releases/v1.0.0/manifest.json',
    './releases/v1.0.0/manifest.json',
    '/releases/v1.0.0/manifest.json'
  ];

  for (const candidate of candidates) {
    try {
      const res = await fetch(candidate, { method: 'HEAD' });
      if (res.ok) {
        if (candidate === 'manifest.json') {
          detectedPathPrefix = '';
        } else if (candidate.startsWith('../releases/')) {
          detectedPathPrefix = '../releases/';
        } else if (candidate.startsWith('releases/')) {
          detectedPathPrefix = 'releases/';
        } else if (candidate.startsWith('./releases/')) {
          detectedPathPrefix = './releases/';
        } else if (candidate.startsWith('/releases/')) {
          detectedPathPrefix = '/releases/';
        }
        console.log(`Resolved releases path prefix: "${detectedPathPrefix}" using probe: ${candidate}`);
        return;
      }
    } catch (e) {
      // Continue checking next candidate
    }
  }
  detectedPathPrefix = '';
}

async function loadVersionRegistry() {
  const candidateUrls = [
    'versions.json',
    `${detectedPathPrefix}versions.json`,
    '../releases/versions.json',
    './releases/versions.json'
  ];

  for (const url of candidateUrls) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.releases && data.releases.length > 0) {
          availableReleases = data.releases.map(rel => {
            const tag = rel.tag || `v${rel.version}`;
            const manifestPath = detectedPathPrefix ? `${detectedPathPrefix}${tag}/manifest.json` : 'manifest.json';
            const binPath = detectedPathPrefix ? `${detectedPathPrefix}${tag}/firmware.bin` : 'firmware.bin';
            const factoryBinPath = detectedPathPrefix ? `${detectedPathPrefix}${tag}/factory_firmware.bin` : 'factory_firmware.bin';
            return {
              ...rel,
              tag: tag,
              manifest: manifestPath,
              bin: binPath,
              factory_bin: factoryBinPath
            };
          });
          return;
        }
      }
    } catch (err) {
      // Try next
    }
  }

  availableReleases = DEFAULT_RELEASES;
}

function initVersionSelector() {
  const select = document.getElementById('version-select');
  if (!select) return;
  select.innerHTML = '';

  availableReleases.forEach(rel => {
    const opt = document.createElement('option');
    opt.value = rel.tag;
    opt.textContent = `${rel.tag} ${rel.is_latest ? '(Latest Stable)' : ''}`;
    select.appendChild(opt);
  });

  select.addEventListener('change', (e) => {
    updateSelectedVersion(e.target.value);
  });

  if (availableReleases.length > 0) {
    updateSelectedVersion(availableReleases[0].tag);
  }
}

function updateSelectedVersion(tag) {
  const rel = availableReleases.find(r => r.tag === tag) || availableReleases[0];
  
  // Update Meta labels
  const metaVer = document.getElementById('meta-version');
  const metaOffset = document.getElementById('meta-offset');
  const metaSize = document.getElementById('meta-size');

  if (metaVer) metaVer.textContent = rel.tag;
  if (metaOffset) metaOffset.textContent = '0x10000';
  if (metaSize) metaSize.textContent = rel.size ? `${Math.round(rel.size / 1024)} KB` : '~360 KB';

  // Construct absolute/resolved URL to ensure <esp-web-install-button> can always load it
  const manifestUrl = new URL(rel.manifest, window.location.href).href;

  // Update ESP Web Tools Install Button Manifest attribute & property
  const installBtn = document.getElementById('esp-install-btn');
  if (installBtn) {
    installBtn.setAttribute('manifest', manifestUrl);
    installBtn.manifest = manifestUrl;
  }

  // Update CLI command sample
  const cliSnippet = document.getElementById('cli-code-snippet');
  if (cliSnippet) {
    cliSnippet.textContent = `esptool.py --chip esp32 --port COMx write_flash 0x0 releases/${rel.tag}/factory_firmware.bin`;
  }
}

function renderDownloadsTable() {
  const tbody = document.getElementById('releases-tbody');
  if (!tbody) return;

  tbody.innerHTML = availableReleases.map(rel => `
    <tr>
      <td>
        <span class="tag-badge ${rel.is_latest ? 'latest' : ''}">${rel.tag}</span>
        ${rel.is_latest ? '<span style="color:var(--accent-emerald);margin-left:0.5rem;font-size:0.8rem;font-weight:600;">LATEST</span>' : ''}
      </td>
      <td style="color:var(--text-secondary);font-family:var(--font-mono);font-size:0.85rem;">
        <strong style="color:var(--accent-cyan);">0x0</strong> (Merged Factory)
      </td>
      <td style="color:var(--text-muted);font-size:0.85rem;">${rel.factory_size ? `${Math.round(rel.factory_size / 1024)} KB` : '~420 KB'}</td>
      <td style="text-align:right;">
        <a href="${rel.factory_bin || 'factory_firmware.bin'}" download="clicker-${rel.tag}-factory.bin" class="btn-download" title="Download Merged Factory Binary for web.esphome.io / esptool at offset 0x0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          <span>factory_firmware.bin</span>
        </a>
      </td>
    </tr>
  `).join('');
}

function initClipboardButtons() {
  document.querySelectorAll('.btn-copy').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        navigator.clipboard.writeText(targetEl.textContent.trim()).then(() => {
          const originalText = btn.textContent;
          btn.textContent = 'Copied!';
          btn.style.background = 'var(--accent-emerald)';
          btn.style.color = '#000';
          setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
            btn.style.color = '';
          }, 2000);
        });
      }
    });
  });
}
