/**
 * mobile-nav.js — SimkopdesV2
 * Auto-injects mobile navigation elements:
 *   - Hamburger button (inside top header)
 *   - Sidebar overlay (close drawer on tap outside)
 *   - Bottom navigation bar (5 main items)
 * Works on any page that contains .dashboard-shell.
 */
(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        var shell = document.querySelector('.dashboard-shell');
        if (!shell) return; // Not a dashboard page, exit early

        // --- Compute base path for navigation links ---
        // Pages in /www/pages/*/*.html are 2 levels deep, root pages are 0 levels deep.
        var isInPages = window.location.pathname.indexOf('/pages/') !== -1;
        var base = isInPages ? '../../' : '';

        var currentPath = window.location.pathname;

        // ============================================================
        // 1. Inject Hamburger Button into .header-left
        // ============================================================
        var headerLeft = document.querySelector('.header-left');
        if (headerLeft) {
            var hamburger = document.createElement('button');
            hamburger.className = 'btn-hamburger';
            hamburger.id = 'btnHamburger';
            hamburger.setAttribute('aria-label', 'Buka menu navigasi');
            hamburger.setAttribute('type', 'button');
            hamburger.innerHTML = '<i class="ph ph-list"></i>';
            headerLeft.insertBefore(hamburger, headerLeft.firstChild);
        }

        // ============================================================
        // 2. Inject Sidebar Overlay
        // ============================================================
        var overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        overlay.id = 'sidebarOverlay';
        shell.insertBefore(overlay, shell.firstChild);

        // ============================================================
        // 3. Inject Bottom Navigation Bar
        // ============================================================
        var bottomNav = document.createElement('nav');
        bottomNav.className = 'mobile-bottom-nav';
        bottomNav.setAttribute('aria-label', 'Navigasi utama mobile');

        var navItems = [
            {
                href: base + 'profil.html',
                icon: 'ph-house',
                label: 'Beranda',
                matchPattern: /profil\.html/
            },
            {
                href: base + 'pages/layanan/semua-permohonan.html',
                icon: 'ph-file-text',
                label: 'Permohonan',
                matchPattern: /semua-permohonan/
            },
            {
                href: base + 'pages/keuangan/simpanan-tagihan.html',
                icon: 'ph-wallet',
                label: 'Keuangan',
                matchPattern: /simpanan|pinjaman|laporan-keuangan|shu|akun-bank|modal/
            },
            {
                href: base + 'pages/master/anggota.html',
                icon: 'ph-users',
                label: 'Anggota',
                matchPattern: /anggota|karyawan|pengurus/
            },
            {
                href: '#',
                icon: 'ph-list',
                label: 'Menu',
                matchPattern: null,
                id: 'bottomNavMenu',
                isButton: true
            }
        ];

        navItems.forEach(function (item) {
            var el;
            if (item.isButton) {
                el = document.createElement('button');
                el.setAttribute('type', 'button');
            } else {
                el = document.createElement('a');
                el.href = item.href;
            }
            el.className = 'bottom-nav-item';
            if (item.id) el.id = item.id;

            // Mark active item based on current URL
            if (item.matchPattern && item.matchPattern.test(currentPath)) {
                el.classList.add('active');
            }

            el.innerHTML =
                '<i class="ph ' + item.icon + '"></i>' +
                '<span>' + item.label + '</span>';

            bottomNav.appendChild(el);
        });

        shell.appendChild(bottomNav);

        // ============================================================
        // 4. Sidebar Drawer Logic
        // ============================================================
        var sidebar = document.querySelector('.sidebar');
        var hamburgerBtn = document.getElementById('btnHamburger');
        var sidebarOverlay = document.getElementById('sidebarOverlay');
        var menuBtn = document.getElementById('bottomNavMenu');

        function openSidebar() {
            if (sidebar) sidebar.classList.add('open');
            if (sidebarOverlay) {
                sidebarOverlay.style.display = 'block';
                // Force reflow before adding class for CSS transition to fire
                sidebarOverlay.offsetHeight; // eslint-disable-line no-unused-expressions
                sidebarOverlay.classList.add('active');
            }
            document.body.style.overflow = 'hidden';
        }

        function closeSidebar() {
            if (sidebar) sidebar.classList.remove('open');
            if (sidebarOverlay) {
                sidebarOverlay.classList.remove('active');
                setTimeout(function () {
                    sidebarOverlay.style.display = 'none';
                }, 300);
            }
            document.body.style.overflow = '';
        }

        if (hamburgerBtn) {
            hamburgerBtn.addEventListener('click', openSidebar);
        }

        if (sidebarOverlay) {
            sidebarOverlay.addEventListener('click', closeSidebar);
        }

        if (menuBtn) {
            menuBtn.addEventListener('click', function (e) {
                e.preventDefault();
                openSidebar();
            });
        }

        // Close sidebar when a nav item is tapped (page navigation will happen)
        if (sidebar) {
            var navLinks = sidebar.querySelectorAll('.nav-item');
            navLinks.forEach(function (link) {
                link.addEventListener('click', closeSidebar);
            });
        }

        // Close sidebar if window is resized to desktop
        window.addEventListener('resize', function () {
            if (window.innerWidth > 768) {
                closeSidebar();
            }
        });

        // ============================================================
        // 7. User Profile Dropdown
        // ============================================================
        var userProfile = document.querySelector('.user-profile');

        if (userProfile) {
            // Build dropdown HTML
            var dropdown = document.createElement('div');
            dropdown.className = 'user-dropdown';
            dropdown.id = 'userDropdown';

            // Read user name from the existing span in header (if any)
            var userNameSpan = userProfile.querySelector('span');
            var userName = userNameSpan ? userNameSpan.textContent.trim() : 'Pengguna';

            dropdown.innerHTML =
                '<div class="user-dropdown-header">' +
                    '<div class="user-dropdown-avatar"><i class="ph ph-user"></i></div>' +
                    '<div class="user-dropdown-info">' +
                        '<div class="user-dropdown-name">' + userName + '</div>' +
                        '<div class="user-dropdown-role">Manajer Koperasi</div>' +
                    '</div>' +
                '</div>' +
                '<a href="' + base + 'profil.html" class="user-dropdown-item">' +
                    '<i class="ph ph-buildings"></i>' +
                    'Profil Koperasi' +
                '</a>' +
                '<div class="user-dropdown-divider"></div>' +
                '<button type="button" class="user-dropdown-item logout-item" id="btnLogoutDropdown">' +
                    '<i class="ph ph-sign-out"></i>' +
                    'Keluar' +
                '</button>';

            userProfile.appendChild(dropdown);

            function openDropdown(e) {
                e.stopPropagation();
                var isOpen = dropdown.classList.contains('open');
                // Close all other dropdowns first
                document.querySelectorAll('.user-dropdown.open').forEach(function (d) {
                    d.classList.remove('open');
                });
                document.querySelectorAll('.user-profile.dropdown-open').forEach(function (p) {
                    p.classList.remove('dropdown-open');
                });
                if (!isOpen) {
                    dropdown.classList.add('open');
                    userProfile.classList.add('dropdown-open');
                }
            }

            function closeDropdown() {
                dropdown.classList.remove('open');
                userProfile.classList.remove('dropdown-open');
            }

            userProfile.addEventListener('click', openDropdown);

            // Close dropdown when clicking/tapping outside
            document.addEventListener('click', closeDropdown);
            document.addEventListener('touchstart', function (e) {
                if (!userProfile.contains(e.target)) {
                    closeDropdown();
                }
            }, { passive: true });
        }

        // ============================================================
        // 8. Logout Confirmation Modal
        // ============================================================
        var logoutModal = document.createElement('div');
        logoutModal.className = 'logout-modal-overlay';
        logoutModal.id = 'logoutModal';
        logoutModal.innerHTML =
            '<div class="logout-modal-card">' +
                '<div class="logout-modal-icon">' +
                    '<i class="ph ph-sign-out"></i>' +
                '</div>' +
                '<h3>Keluar dari Akun?</h3>' +
                '<p>Anda akan keluar dari sesi ini. Pastikan semua data sudah tersimpan sebelum melanjutkan.</p>' +
                '<div class="logout-modal-actions">' +
                    '<button type="button" class="logout-btn-cancel" id="logoutCancel">Batal</button>' +
                    '<button type="button" class="logout-btn-confirm" id="logoutConfirm">Ya, Keluar</button>' +
                '</div>' +
            '</div>';

        document.body.appendChild(logoutModal);

        function openLogoutModal() {
            // Close dropdown first
            var openDropdown = document.querySelector('.user-dropdown.open');
            if (openDropdown) openDropdown.classList.remove('open');
            if (userProfile) userProfile.classList.remove('dropdown-open');

            logoutModal.style.display = 'flex';
            logoutModal.offsetHeight; // force reflow for transition
            logoutModal.classList.add('open');
            document.body.style.overflow = 'hidden';
        }

        function closeLogoutModal() {
            logoutModal.classList.remove('open');
            document.body.style.overflow = '';
            // Hide after transition
            setTimeout(function () {
                logoutModal.style.display = 'none';
            }, 280);
        }

        function performLogout() {
            // Tutup modal agar ada feedback visual
            closeLogoutModal();

            // Hapus data sesi
            try { localStorage.clear(); } catch (e) {}
            try { sessionStorage.clear(); } catch (e) {}
            
            // Redirect ke halaman login dengan sedikit delay
            setTimeout(function() {
                var currentHref = window.location.href;
                // Safest fallback for APK / WebView environments
                var wwwIndex = currentHref.indexOf('/www/');
                if (wwwIndex !== -1) {
                    var loginUrl = currentHref.substring(0, wwwIndex + 5) + 'index.html';
                    window.location.href = loginUrl;
                } else {
                    var path = window.location.pathname;
                    if (path.indexOf('/pages/') !== -1) {
                        window.location.href = '../../index.html';
                    } else {
                        window.location.href = 'index.html';
                    }
                }
            }, 150);
        }

        // Trigger logout from dropdown button
        document.addEventListener('click', function (e) {
            var btnDropdown = e.target.closest('#btnLogoutDropdown');
            if (btnDropdown) {
                e.stopPropagation();
                openLogoutModal();
            }
            
            // Trigger logout from sidebar link
            var btnSidebar = e.target.closest('[data-action="logout"]');
            if (btnSidebar) {
                e.preventDefault();
                openLogoutModal();
            }

            // Modal action: Cancel
            var btnCancel = e.target.closest('#logoutCancel');
            if (btnCancel) {
                closeLogoutModal();
            }

            // Modal action: Confirm
            var btnConfirm = e.target.closest('#logoutConfirm');
            if (btnConfirm) {
                performLogout();
            }
        });

        // Tap overlay background to cancel
        logoutModal.addEventListener('click', function (e) {
            if (e.target === logoutModal) {
                closeLogoutModal();
            }
        });

        // Initialize modal as hidden
        logoutModal.style.display = 'none';

        // ============================================================
        // Swipe-to-close: detect left swipe on open sidebar
        // ============================================================
        var touchStartX = 0;
        var touchStartY = 0;

        document.addEventListener('touchstart', function (e) {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        document.addEventListener('touchend', function (e) {
            if (!sidebar || !sidebar.classList.contains('open')) return;
            var dx = e.changedTouches[0].clientX - touchStartX;
            var dy = Math.abs(e.changedTouches[0].clientY - touchStartY);
            if (dx < -60 && dy < 80) {
                closeSidebar();
            }
        }, { passive: true });

        // Edge swipe-to-open: right swipe from left edge
        document.addEventListener('touchend', function (e) {
            if (sidebar && sidebar.classList.contains('open')) return;
            var dx = e.changedTouches[0].clientX - touchStartX;
            var dy = Math.abs(e.changedTouches[0].clientY - touchStartY);
            if (touchStartX < 30 && dx > 60 && dy < 80) {
                openSidebar();
            }
        }, { passive: true });
    });
})();

