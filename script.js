document.addEventListener('DOMContentLoaded', () => {
    const desktop = document.querySelector('.background');
    console.log('Desktop element:', desktop);
    const windowElement = document.querySelector('.window');
    const windowTitle = document.querySelector('.window-title');
    const windowBody = document.querySelector('.window-body');
    const windowHeader = document.querySelector('.window-header');
    const stickyNote = document.querySelector('.sticky-note');
    const portfolioTextP = document.querySelector('.portfolio-text p');

    const galleryGroups = {
        photography: [
            { name: 'IMG 1427', src: 'assets portfolio/Photography/IMG_1427.JPG' },
            { name: 'Portrait', src: 'assets portfolio/Photography/portrait.jpg' },
            { name: 'Portrait 2', src: 'assets portfolio/Photography/portrait 2.jpg' },
            { name: 'Rawat R 005', src: 'assets portfolio/Photography/RAWAT R 005.jpg' },
            { name: 'Rawat R 019', src: 'assets portfolio/Photography/RAWAT R 019.jpg' },
            { name: 'Rawat R 020', src: 'assets portfolio/Photography/RAWAT R 020.jpg' },
            { name: 'Light Painting', src: 'assets portfolio/Photography/RAWAT R 02 Light painting.jpg' }
        ]
    };

    function setWindowBodyMode(targetBody, mode) {
        targetBody.classList.toggle('is-folder', mode === 'folder');
        if (mode === 'folder') {
            targetBody.classList.remove('is-media');
        }
    }

    /** Narrow / touch: single tap opens; desktop keeps double-click */
    function preferSingleTapOpen() {
        return window.matchMedia('(max-width: 768px), (pointer: coarse)').matches;
    }

    function bindOpenGesture(element, handler) {
        let lastFire = 0;
        const run = (e) => {
            const now = Date.now();
            if (now - lastFire < 420) return;
            lastFire = now;
            handler(e);
        };
        element.addEventListener('dblclick', (e) => {
            if (preferSingleTapOpen()) return;
            e.preventDefault();
            run(e);
        });
        element.addEventListener('click', (e) => {
            if (!preferSingleTapOpen()) return;
            if (e.detail !== 1) return;
            run(e);
        });
    }

    function renderGallery(targetBody, groupId, initialSrc, titleEl) {
        const items = galleryGroups[groupId] || [];
        if (!items.length) return;

        let currentIndex = Math.max(0, items.findIndex(item => item.src === initialSrc));

        targetBody.innerHTML = `
            <div class="gallery-view">
                <button class="gallery-nav prev" aria-label="Previous photo">‹</button>
                <img class="gallery-image" src="" alt="" />
                <button class="gallery-nav next" aria-label="Next photo">›</button>
            </div>
            <div class="gallery-caption"></div>
        `;

        const imageEl = targetBody.querySelector('.gallery-image');
        const captionEl = targetBody.querySelector('.gallery-caption');
        const prevBtn = targetBody.querySelector('.gallery-nav.prev');
        const nextBtn = targetBody.querySelector('.gallery-nav.next');

        const updateView = () => {
            const item = items[currentIndex];
            imageEl.src = item.src;
            imageEl.alt = item.name;
            captionEl.textContent = item.name;
            if (titleEl) titleEl.textContent = item.name;
        };

        const goPrev = () => {
            currentIndex = (currentIndex - 1 + items.length) % items.length;
            updateView();
        };

        const goNext = () => {
            currentIndex = (currentIndex + 1) % items.length;
            updateView();
        };

        prevBtn.addEventListener('click', goPrev);
        nextBtn.addEventListener('click', goNext);

        const onKeyDown = (e) => {
            if (e.key === 'ArrowLeft') goPrev();
            if (e.key === 'ArrowRight') goNext();
        };

        document.addEventListener('keydown', onKeyDown);
        const cleanup = () => document.removeEventListener('keydown', onKeyDown);

        updateView();
        setWindowBodyMode(targetBody, 'default');
        targetBody.classList.add('is-gallery');
        return cleanup;
    }

    let cascadingWindowOffset = 0; // New global counter for cascading offset
    let currentZIndex = 1000; // Global z-index counter

    // Window registry to keep track of created windows for reuse
    const windowRegistry = {};

    // Correctly reference the macOS-style traffic light buttons for the main window
    const mainAppCloseBtn = windowElement.querySelector('.window-btn.close');
    const mainAppMinBtn = windowElement.querySelector('.window-btn.minimize');
    const mainAppFullBtn = windowElement.querySelector('.window-btn.fullscreen');

    makeDraggable(stickyNote);

    const dock = document.querySelector('.dock');
    console.log('Dock element:', dock);

    const apps = [
        { name: 'Finder', icon: 'assets portfolio/additional assets/finder.png', content: 'Finder content.' },
        { name: 'Messages', icon: 'assets portfolio/additional assets/messages.webp', content: 'Messages content.' },
        { name: 'App Store', icon: 'assets portfolio/additional assets/appstores.png', content: 'App Store content.' },
        { name: 'VS Code', icon: 'assets portfolio/additional assets/vscode.png', content: 'VS Code content.' },
        { name: 'Figma', icon: 'assets portfolio/additional assets/figma.webp', content: 'Figma content.' },
        { name: 'After Effects', icon: 'assets portfolio/additional assets/aftereffects.png', content: 'After Effects content.' },
        { name: 'Adobe', icon: 'assets portfolio/additional assets/adobe.png', content: 'Adobe content.' },
        { name: 'Notes', icon: 'assets portfolio/additional assets/notes.png', content: 'Notes content.' },
        { name: 'Settings', icon: 'assets portfolio/additional assets/settings.png', content: 'Settings content.' },
        
    ];

    // Reuse the same Motion Graphics items in multiple places (Projects folder + After Effects app)
    const motionGraphicsProjects = [
        {
            name: 'Razer Logo Animation',
            icon: 'assets portfolio/additional assets/folder.png',
            type: 'file',
            content: '<video src="assets portfolio/Motion Graphics/razerlogofinal.mp4" controls style="width:100%; height:100%;"></video>'
        },
        {
            name: 'Render',
            icon: 'assets portfolio/additional assets/folder.png',
            type: 'file',
            content: '<video src="assets portfolio/Motion Graphics/Render.mp4" controls style="width:100%; height:100%;"></video>'
        }
    ];

    function createCalendarIcon() {
        const calendar = document.createElement('div');
        calendar.classList.add('dock-item', 'calendar');
        
        const date = new Date();
        const dayOfWeek = date.toLocaleString('default', { weekday: 'short' });
        const day = date.getDate();

        calendar.innerHTML = `
            <span class="day-of-week">${dayOfWeek}</span>
            <span class="day">${day}</span>
        `;
        dock.appendChild(calendar);
    }
    
    createCalendarIcon();

    apps.forEach(app => {
        const dockItem = document.createElement('div');
        dockItem.classList.add('dock-item');
        dockItem.innerHTML = `<img src="${app.icon}" alt="${app.name}"/><span>${app.name}</span>`;
        dock.appendChild(dockItem);
        console.log('Dock item created:', app.name, dockItem);

        bindOpenGesture(dockItem, () => {
            // Check if window already exists and is hidden
            if (windowRegistry[app.name] && windowRegistry[app.name].style.display === 'none') {
                const existingWindow = windowRegistry[app.name];
                existingWindow.style.display = 'block';
                existingWindow.style.opacity = '1';
                existingWindow.style.transform = 'translate(-50%, -50%) scale(1)';
                bringWindowToFront(existingWindow);
                return; // Exit if window reused
            }

            // Use the main window for apps for now, or create a new one if not in registry
            if (app.name === 'Settings') {
                windowTitle.textContent = app.name;
                windowBody.innerHTML = '<div class="settings-panel"><div class="settings-section"><h3>Appearance</h3><label class="toggle-switch"><input type="checkbox" id="darkModeToggle"><span class="slider"></span></label> Dark Mode</div></div>';
                setWindowBodyMode(windowBody, 'default');
                openMainWindow(app.name);

                const darkModeToggle = document.getElementById('darkModeToggle');
                if (darkModeToggle) {
                    darkModeToggle.checked = document.body.classList.contains('dark-mode');
                    darkModeToggle.addEventListener('change', () => {
                        document.body.classList.toggle('dark-mode', darkModeToggle.checked);
                        localStorage.setItem('darkMode', darkModeToggle.checked);
                    });
                }
            } else if (app.name === 'Figma') {
                // Show the same UI/UX (Active Life Center) items inside the Figma app
                windowTitle.textContent = app.name;
                windowBody.innerHTML = '<div class="folder-grid"></div>';
                setWindowBodyMode(windowBody, 'folder');

                const grid = windowBody.querySelector('.folder-grid');
                const uiuxCategory = projectCategories.find(c => c.name === 'UI/UX');
                const uiuxItems = uiuxCategory?.subfolders || [];

                uiuxItems.forEach(item => {
                    const el = document.createElement('div');
                    el.classList.add('folder-item');
                    el.innerHTML = `
                        <img src="${item.icon}" alt="folder"/>
                        <span>${item.name}</span>
                    `;
                    bindOpenGesture(el, () => createNewWindow(item));
                    grid.appendChild(el);
                });

                openMainWindow(app.name);
            } else if (app.name === 'After Effects') {
                // Show Motion Graphics projects inside After Effects (shortcuts)
                windowTitle.textContent = app.name;
                windowBody.innerHTML = '<div class="folder-grid"></div>';
                setWindowBodyMode(windowBody, 'folder');

                const grid = windowBody.querySelector('.folder-grid');
                motionGraphicsProjects.forEach(item => {
                    const el = document.createElement('div');
                    el.classList.add('folder-item');
                    el.innerHTML = `
                        <img src="${item.icon}" alt="folder"/>
                        <span>${item.name}</span>
                    `;
                    bindOpenGesture(el, () => createNewWindow(item));
                    grid.appendChild(el);
                });

                openMainWindow(app.name);
            } else {
                windowTitle.textContent = app.name;
                windowBody.innerHTML = app.content;
                setWindowBodyMode(windowBody, 'default');
                openMainWindow(app.name); // Open main window for other apps
            }
        });
    });

    const projectCategories = [
        { 
            name: 'Graphic Design', 
            icon: 'assets portfolio/additional assets/folder.png', 
            type: 'category', 
            subfolders: [] 
        },
        { 
            name: 'Branding', 
            icon: 'assets portfolio/additional assets/folder.png', 
            type: 'category', 
            subfolders: [
                {
                    name: 'Razer Branding Project',
                    icon: 'assets portfolio/additional assets/folder.png',
                    type: 'file',
                    externalLink: 'assets portfolio/Branding/Razer Branding Project/razer project.pdf'
                },
                {
                    name: 'Sweet Sentiments Branding Project',
                    icon: 'assets portfolio/additional assets/folder.png',
                    type: 'file',
                    externalLink: 'assets portfolio/Branding/Sweet Sentiment/branding sweet sentiments .pdf'
                }
            ] 
        },
        { 
            name: 'Photography', 
            icon: 'assets portfolio/additional assets/folder.png', 
            type: 'category', 
            subfolders: [
                {
                    name: 'IMG 1427',
                    icon: 'assets portfolio/Photography/IMG_1427.JPG',
                    type: 'file',
                    group: 'photography',
                    src: 'assets portfolio/Photography/IMG_1427.JPG'
                },
                {
                    name: 'Portrait',
                    icon: 'assets portfolio/Photography/portrait.jpg',
                    type: 'file',
                    group: 'photography',
                    src: 'assets portfolio/Photography/portrait.jpg'
                },
                {
                    name: 'Portrait 2',
                    icon: 'assets portfolio/Photography/portrait 2.jpg',
                    type: 'file',
                    group: 'photography',
                    src: 'assets portfolio/Photography/portrait 2.jpg'
                },
                {
                    name: 'Rawat R 005',
                    icon: 'assets portfolio/Photography/RAWAT R 005.jpg',
                    type: 'file',
                    group: 'photography',
                    src: 'assets portfolio/Photography/RAWAT R 005.jpg'
                },
                {
                    name: 'Rawat R 019',
                    icon: 'assets portfolio/Photography/RAWAT R 019.jpg',
                    type: 'file',
                    group: 'photography',
                    src: 'assets portfolio/Photography/RAWAT R 019.jpg'
                },
                {
                    name: 'Rawat R 020',
                    icon: 'assets portfolio/Photography/RAWAT R 020.jpg',
                    type: 'file',
                    group: 'photography',
                    src: 'assets portfolio/Photography/RAWAT R 020.jpg'
                },
                {
                    name: 'Light Painting',
                    icon: 'assets portfolio/Photography/RAWAT R 02 Light painting.jpg',
                    type: 'file',
                    group: 'photography',
                    src: 'assets portfolio/Photography/RAWAT R 02 Light painting.jpg'
                }
            ] 
        },
        { 
            name: 'Web Development', 
            icon: 'assets portfolio/additional assets/folder.png', 
            type: 'category', 
            subfolders: [
                {
                    name: 'Web Dev Projects',
                    icon: 'assets portfolio/additional assets/folder.png',
                    type: 'file',
                    externalLink: 'assets portfolio/Web Development/web dev projects.pdf'
                }
            ] 
        },
        { 
            name: 'UI/UX', 
            icon: 'assets portfolio/additional assets/folder.png', 
            type: 'category', 
            subfolders: [
                {
                    name: 'Active Life Center Project',
                    icon: 'assets portfolio/additional assets/figma.webp',
                    type: 'category',
                    externalLink: 'https://www.figma.com/design/PIY9Qhp6GZBKyJb5KufnQy/RawatRishabh?node-id=1-8&t=BYtY5npOlQsrXVNW-1',
                    subfolders: [
                        {
                            name: 'Project',
                            icon: 'assets portfolio/additional assets/folder.png',
                            type: 'category',
                            subfolders: []
                        },
                        {
                            name: 'Prototype',
                            icon: 'assets portfolio/additional assets/folder.png',
                            type: 'category',
                            subfolders: []
                        }
                    ]
                },
                {
                    name: 'Active Life Center portotype laptop',
                    icon: 'assets portfolio/additional assets/figma.webp',
                    type: 'category',
                    externalLink: 'https://www.figma.com/proto/PIY9Qhp6GZBKyJb5KufnQy/RawatRishabh?node-id=40000365-813&p=f&t=B3ro8KPDofEV4C0V-1&scaling=scale-down&content-scaling=fixed&page-id=1%3A14&starting-point-node-id=40000365%3A813',
                    subfolders: []
                },
                {
                    name: 'Active Life Center portotype tablet',
                    icon: 'assets portfolio/additional assets/figma.webp',
                    type: 'category',
                    externalLink: 'https://www.figma.com/proto/PIY9Qhp6GZBKyJb5KufnQy/RawatRishabh?node-id=40000377-308&t=wcXqTNPGhv6KU38x-1&scaling=scale-down&content-scaling=fixed&page-id=1%3A13&starting-point-node-id=40000377%3A308',
                    subfolders: []
                },
                {
                    name: 'Active Life Center portotype mobile',
                    icon: 'assets portfolio/additional assets/figma.webp',
                    type: 'category',
                    externalLink: 'https://www.figma.com/proto/PIY9Qhp6GZBKyJb5KufnQy/RawatRishabh?node-id=40000425-544&t=5uFZBOUJCOArEwEh-1&scaling=scale-down&content-scaling=fixed&page-id=1%3A12&starting-point-node-id=40000425%3A639',
                    subfolders: []
                }
            ] 
        },
        { 
            name: 'Motion Graphics', 
            icon: 'assets portfolio/additional assets/folder.png', 
            type: 'category', 
            subfolders: motionGraphicsProjects
        }
    ];
       
    const folders = [
        { name: 'Portfolio', icon: 'assets portfolio/additional assets/folder.png', type: 'file', externalLink: 'assets portfolio/additional assets/portfolio.pdf', x: 300, y: 560 },
        { name: 'Projects', icon: 'assets portfolio/additional assets/folder.png', type: 'category', subfolders: projectCategories, x: 800, y: 200 },
        { name: 'Resume.pdf', icon: 'assets portfolio/additional assets/folder.png', type: 'file', externalLink: 'assets portfolio/additional assets/Resume_Rishabh_Rawat.pdf', x: 150, y: 500 }
    ];

    const desktopFolderEntries = [];
    const mobileFolderOrder = ['Portfolio', 'Resume.pdf', 'Projects'];

    function computeFolderPosition(folder, w, h) {
        const slotW = 100;
        if (w < 640) {
            const idx = mobileFolderOrder.indexOf(folder.name);
            const i = idx >= 0 ? idx : 0;
            const cols = mobileFolderOrder.length;
            const pad = 10;
            const usable = Math.max(0, w - pad * 2);
            const colW = usable / cols;
            const x = pad + i * colW + (colW - slotW) / 2;
            const y = Math.min(h - 130, Math.max(248, h * 0.52));
            return { x: Math.round(x), y: Math.round(y) };
        }
        if (w < 1100) {
            const sx = Math.min(1.15, w / 1050);
            const sy = Math.min(1.1, h / 780);
            return {
                x: Math.round(Math.min(folder.x * sx, w - slotW - 8)),
                y: Math.round(Math.min(folder.y * sy, h - 130))
            };
        }
        return { x: folder.x, y: folder.y };
    }

    function layoutDesktopFolders() {
        const w = window.innerWidth;
        const h = window.innerHeight || document.documentElement.clientHeight;
        desktopFolderEntries.forEach(({ element, folder }) => {
            const p = computeFolderPosition(folder, w, h);
            element.style.left = `${p.x}px`;
            element.style.top = `${p.y}px`;
        });
    }

    // Bring a window/folder to the front using a single shared z-index counter
    function bringWindowToFront(targetWindow) {
        currentZIndex++;
        targetWindow.style.zIndex = currentZIndex;
    }

    folders.forEach(folder => {
        const folderElement = document.createElement('div');
        folderElement.classList.add('folder');
        folderElement.innerHTML = `<img src="${folder.icon}" alt="folder"/><span>${folder.name}</span>`;
        folderElement.dataset.folderName = folder.name;
        desktop.appendChild(folderElement);
        desktopFolderEntries.push({ element: folderElement, folder });

        makeDraggable(folderElement);

        bindOpenGesture(folderElement, () => {
            // Check if window already exists and is hidden
            if (windowRegistry[folder.name] && windowRegistry[folder.name].style.display === 'none') {
                const existingWindow = windowRegistry[folder.name];
                existingWindow.style.display = 'block';
                existingWindow.style.opacity = '1';
                existingWindow.style.transform = 'translate(-50%, -50%) scale(1)';
                bringWindowToFront(existingWindow);
                return; // Exit if window reused
            }

            // Special handling for Projects folder
            if (folder.name === 'Projects') {
                windowTitle.textContent = folder.name;
                windowBody.innerHTML = '<div class="folder-grid"></div>';
                setWindowBodyMode(windowBody, 'folder');
                const folderGrid = windowBody.querySelector('.folder-grid');
                
                projectCategories.forEach(subfolder => {
                    const subfolderElement = document.createElement('div');
                    subfolderElement.classList.add('folder-item');
                    subfolderElement.innerHTML = `
                        <img src="${subfolder.icon}" alt="folder"/>
                        <span>${subfolder.name}</span>
                    `;
                    
                    bindOpenGesture(subfolderElement, () => {
                        createNewWindow(subfolder);
                    });
                    
                    folderGrid.appendChild(subfolderElement);
                });
                openMainWindow(folder.name); // Open main window for Projects content
            } else {
                createNewWindow({
                    name: folder.name,
                    type: folder.type || 'file',
                    content: folder.content,
                    externalLink: folder.externalLink,
                    subfolders: folder.subfolders,
                    icon: folder.icon
                });
            }
        });
    });

    layoutDesktopFolders();
    let folderLayoutTimer;
    const scheduleFolderLayout = () => {
        clearTimeout(folderLayoutTimer);
        folderLayoutTimer = setTimeout(layoutDesktopFolders, 100);
    };
    window.addEventListener('resize', scheduleFolderLayout);
    window.addEventListener('orientationchange', scheduleFolderLayout);

    // Function to open the main window (reused for general content like About Me, Projects)
    function openMainWindow(title) {
        windowElement.style.display = 'block';
        windowElement.style.opacity = '1';
        windowElement.style.transform = 'translate(-50%, -50%) scale(1)';
        bringWindowToFront(windowElement);
        windowTitle.textContent = title; // Update title
    }

    function closeWindow() {
        windowElement.style.opacity = '0';
        windowElement.style.transform = 'translate(-50%, -50%) scale(0.98)';
        setTimeout(() => {
            windowElement.style.display = 'none';
        }, 200);
    }

    // Attach event listener to the main app's close button
    if (mainAppCloseBtn) mainAppCloseBtn.addEventListener('click', closeWindow);

    let isMinimized = false;
    function toggleMinimize() {
        if (!isMinimized) {
            windowElement.style.transform = 'translate(-50%, calc(50% + 120px)) scale(0.9)';
            windowElement.style.opacity = '0.6';
        } else {
            windowElement.style.transform = 'translate(-50%, -50%) scale(1)';
            windowElement.style.opacity = '1';
        }
        isMinimized = !isMinimized;
    }
    if (mainAppMinBtn) mainAppMinBtn.addEventListener('click', toggleMinimize);

    let isFull = false;
    function toggleFull() {
        if (!isFull) {
            windowElement.style.top = '50%';
            windowElement.style.left = '50%';
            windowElement.style.width = '90vw';
            windowElement.style.height = '80vh';
        } else {
            windowElement.style.width = '720px';
            windowElement.style.height = '480px';
        }
        isFull = !isFull;
    }
    if (mainAppFullBtn) mainAppFullBtn.addEventListener('click', toggleFull);

    // Function to create new windows for subfolders (categories + files)
    // Supports either:
    // - createNewWindow({ name, type: 'category'|'file', icon?, subfolders?, content? })
    // - createNewWindow(title: string, content: string)  // legacy usage
    function createNewWindow(folderItemOrTitle, legacyContent) {
        const folderItem = (typeof folderItemOrTitle === 'object' && folderItemOrTitle !== null)
            ? folderItemOrTitle
            : { name: folderItemOrTitle, type: 'file', content: legacyContent };

        const title = folderItem.name;

        // External link items: open in a new tab instead of a desktop window
        if (folderItem.externalLink) {
            window.open(folderItem.externalLink, '_blank', 'noopener,noreferrer');
            return;
        }

        if (folderItem.type === 'category' && folderItem.name === 'Graphic Design') {
            window.open('assets portfolio/additional assets/portfolio.pdf', '_blank', 'noopener,noreferrer');
            return;
        }

        // Check if window already exists and is hidden
        if (windowRegistry[title] && windowRegistry[title].style.display === 'none') {
            const existingWindow = windowRegistry[title];
            existingWindow.style.display = 'block';
            existingWindow.style.opacity = '1';
            existingWindow.style.transform = 'translate(-50%, -50%) scale(1)';
            bringWindowToFront(existingWindow);
            return; // Exit if window reused
        }

        // If window doesn't exist or is not hidden, create a new one
        const newWindow = document.createElement('div');
        newWindow.className = 'window';
        newWindow.style.display = 'block'; // Initially visible
        newWindow.style.opacity = '1';
        newWindow.style.transform = 'translate(-50%, -50%) scale(1)';
        
        // Calculate cascading position
        const offset = Object.keys(windowRegistry).length * 30; // Offset based on number of open/hidden windows
        newWindow.style.top = `calc(50% + ${offset}px)`;
        newWindow.style.left = `calc(50% + ${offset}px)`;

        newWindow.innerHTML = `
            <div class="window-header">
                <div class="window-controls">
                    <button class="window-btn close" aria-label="Close"></button>
                    <button class="window-btn minimize" aria-label="Minimize"></button>
                    <button class="window-btn fullscreen" aria-label="Enter Full Screen"></button>
                </div>
                <div class="window-title">${title}</div>
            </div>
            <div class="window-body"></div>
        `;
        
        document.body.appendChild(newWindow);
        windowRegistry[title] = newWindow; // Add to registry
        bringWindowToFront(newWindow); // Bring to front initially

        // Render category vs file content
        const newWindowBody = newWindow.querySelector('.window-body');
        if (folderItem.type === 'category' && folderItem.name === 'Photography') {
            const photoItems = galleryGroups.photography || [];
            if (photoItems.length) {
                const randomItem = photoItems[Math.floor(Math.random() * photoItems.length)];
                const titleEl = newWindow.querySelector('.window-title');
                const cleanup = renderGallery(newWindowBody, 'photography', randomItem.src, titleEl);
                if (cleanup) newWindow.__cleanup = cleanup;
            }
        } else if (folderItem.type === 'category' && Array.isArray(folderItem.subfolders)) {
            setWindowBodyMode(newWindowBody, 'folder');
            const folderGrid = document.createElement('div');
            folderGrid.classList.add('folder-grid');

            folderItem.subfolders.forEach(sub => {
                const subEl = document.createElement('div');
                subEl.classList.add('folder-item');
                subEl.innerHTML = `
                    <img src="${sub.icon}" alt="folder"/>
                    <span>${sub.name}</span>
                `;
                bindOpenGesture(subEl, () => createNewWindow(sub));
                folderGrid.appendChild(subEl);
            });

            newWindowBody.appendChild(folderGrid);
        } else {
            if (folderItem.group && folderItem.src) {
                const titleEl = newWindow.querySelector('.window-title');
                const cleanup = renderGallery(newWindowBody, folderItem.group, folderItem.src, titleEl);
                if (cleanup) newWindow.__cleanup = cleanup;
            } else {
                newWindowBody.innerHTML = folderItem.content || '';
                const hasMedia = !!newWindowBody.querySelector('iframe, video');
                setWindowBodyMode(newWindowBody, 'default');
                newWindowBody.classList.toggle('is-media', hasMedia);
            }
        }
        
        // Make the new window draggable and add traffic light functionality
        const newHeader = newWindow.querySelector('.window-header');
        const newBtnClose = newWindow.querySelector('.window-btn.close');
        const newBtnMin = newWindow.querySelector('.window-btn.minimize');
        const newBtnFull = newWindow.querySelector('.window-btn.fullscreen');
        
        let isNewWindowDragging = false;
        let newWindowOffsetX, newWindowOffsetY;
        
        newHeader.addEventListener('mousedown', (e) => {
            if (e.target.closest('.window-controls')) return;
            isNewWindowDragging = true;
            newWindowOffsetX = e.clientX - newWindow.offsetLeft;
            newWindowOffsetY = e.clientY - newWindow.offsetTop;
            newHeader.style.cursor = 'grabbing';
            bringWindowToFront(newWindow);
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (isNewWindowDragging) {
                newWindow.style.left = `${e.clientX - newWindowOffsetX}px`;
                newWindow.style.top = `${e.clientY - newWindowOffsetY}px`;
            }
        });
        
        document.addEventListener('mouseup', () => {
            if (isNewWindowDragging) {
                isNewWindowDragging = false;
                newHeader.style.cursor = 'move';
            }
        });
        
        // Traffic light functionality for new windows
        if (newBtnClose) {
            newBtnClose.addEventListener('click', () => {
                if (newWindow.__cleanup) newWindow.__cleanup();
                newWindow.style.opacity = '0';
                newWindow.style.transform = 'translate(-50%, -50%) scale(0.98)';
                setTimeout(() => {
                    newWindow.style.display = 'none';
                }, 200);
            });
        }

        let newWindowMinimized = false;
        if (newBtnMin) {
            newBtnMin.addEventListener('click', () => {
                if (!newWindowMinimized) {
                    newWindow.style.transform = 'translate(-50%, calc(50% + 120px)) scale(0.9)';
                    newWindow.style.opacity = '0.6';
                } else {
                    newWindow.style.transform = 'translate(-50%, -50%) scale(1)';
                    newWindow.style.opacity = '1';
                }
                newWindowMinimized = !newWindowMinimized;
            });
        }

        let newWindowFull = false;
        if (newBtnFull) {
            newBtnFull.addEventListener('click', () => {
                if (!newWindowFull) {
                    newWindow.style.top = '50%';
                    newWindow.style.left = '50%';
                    newWindow.style.width = '90vw';
                    newWindow.style.height = '80vh';
                } else {
                    newWindow.style.width = '720px';
                    newWindow.style.height = '480px';
                }
                newWindowFull = !newWindowFull;
            });
        }
    }

    let isWindowDragging = false;
    let windowOffsetX, windowOffsetY;

    windowHeader.addEventListener('mousedown', (e) => {
        isWindowDragging = true;
        windowOffsetX = e.clientX - windowElement.offsetLeft;
        windowOffsetY = e.clientY - windowElement.offsetTop;
        windowHeader.style.cursor = 'grabbing';
        e.preventDefault(); // Prevent text selection
    });

    document.addEventListener('mousemove', (e) => {
        if (isWindowDragging) {
            windowElement.style.left = `${e.clientX - windowOffsetX}px`;
            windowElement.style.top = `${e.clientY - windowOffsetY}px`;
        }
    });

    document.addEventListener('mouseup', () => {
        if (isWindowDragging) {
            isWindowDragging = false;
            windowHeader.style.cursor = 'move';
        }
    });

    function makeDraggable(element) {
        const TH = 10;
        let activePointerId = null;
        let startX = 0;
        let startY = 0;
        let startLeft = 0;
        let startTop = 0;
        let dragging = false;

        const onPointerMove = (e) => {
            if (e.pointerId !== activePointerId) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            if (!dragging && (dx * dx + dy * dy) >= TH * TH) {
                dragging = true;
                bringWindowToFront(element);
            }
            if (dragging) {
                element.style.left = `${startLeft + dx}px`;
                element.style.top = `${startTop + dy}px`;
            }
        };

        const endDrag = (e) => {
            if (e.pointerId !== activePointerId) return;
            document.removeEventListener('pointermove', onPointerMove);
            document.removeEventListener('pointerup', endDrag);
            document.removeEventListener('pointercancel', endDrag);
            activePointerId = null;
            dragging = false;
        };

        element.addEventListener('pointerdown', (e) => {
            if (e.button !== 0) return;
            if (e.target !== element && !element.contains(e.target)) return;
            activePointerId = e.pointerId;
            startX = e.clientX;
            startY = e.clientY;
            startLeft = element.offsetLeft;
            startTop = element.offsetTop;
            dragging = false;
            document.addEventListener('pointermove', onPointerMove);
            document.addEventListener('pointerup', endDrag);
            document.addEventListener('pointercancel', endDrag);
        });
    }

    const dockItems = document.querySelectorAll('.dock-item');
    const defaultIconSize = 60;
    const maxIconSize = 100;

    dock.addEventListener('mousemove', (e) => {
        const dockRect = dock.getBoundingClientRect();
        const mouseX = e.clientX - dockRect.left;

        dockItems.forEach(item => {
            const itemRect = item.getBoundingClientRect();
            const itemCenterX = itemRect.left - dockRect.left + itemRect.width / 2;
            
            const distance = Math.abs(mouseX - itemCenterX);
            const scale = Math.max(1, 1 - (distance / 150) * (distance / 150) * 1.5 + 0.5);
            const newSize = Math.min(maxIconSize, defaultIconSize * scale);

            item.style.width = `${newSize}px`;
            item.style.height = `${newSize}px`;

            if (item.classList.contains('calendar')) {
                // Font size should not change for calendar text
            } else {
                const imgElement = item.querySelector('img');
                if (imgElement) {
                    imgElement.style.width = `${newSize}px`;
                    imgElement.style.height = `${newSize}px`;
                }
            }
        });
    });

    dock.addEventListener('mouseleave', () => {
        dockItems.forEach(item => {
            item.style.width = `${defaultIconSize}px`;
            item.style.height = `${defaultIconSize}px`;
            
            if (item.classList.contains('calendar')) {
                // Font size should not change for calendar text
            } else {
                const imgElement = item.querySelector('img');
                if (imgElement) {
                    imgElement.style.width = `${defaultIconSize}px`;
                    imgElement.style.height = `${defaultIconSize}px`;
                }
            }
        });
    });

    // Interactive "portfolio." text
    if (portfolioTextP) {
        const letters = portfolioTextP.querySelectorAll('.letter');
        portfolioTextP.addEventListener('mouseover', () => {
            letters.forEach((letter, index) => {
                setTimeout(() => {
                    letter.style.transform = 'scale(1.2)';
                }, index * 50); // Staggered animation
            });
        });

        portfolioTextP.addEventListener('mouseout', () => {
            letters.forEach((letter, index) => {
                setTimeout(() => {
                    letter.style.transform = 'scale(1)';
                }, index * 50); // Staggered animation
            });
        });
    }

    // Initial theme check
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
    }
});
