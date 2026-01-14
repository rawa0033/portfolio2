document.addEventListener('DOMContentLoaded', () => {
    const desktop = document.querySelector('.background');
    console.log('Desktop element:', desktop);
    const windowElement = document.querySelector('.window');
    const windowTitle = document.querySelector('.window-title');
    const windowBody = document.querySelector('.window-body');
    const windowHeader = document.querySelector('.window-header');
    const stickyNote = document.querySelector('.sticky-note');
    const portfolioTextP = document.querySelector('.portfolio-text p');

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

        dockItem.addEventListener('dblclick', () => {
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
                    el.addEventListener('dblclick', () => createNewWindow(item));
                    grid.appendChild(el);
                });

                openMainWindow(app.name);
            } else if (app.name === 'After Effects') {
                // Show Motion Graphics projects inside After Effects (shortcuts)
                windowTitle.textContent = app.name;
                windowBody.innerHTML = '<div class="folder-grid"></div>';

                const grid = windowBody.querySelector('.folder-grid');
                motionGraphicsProjects.forEach(item => {
                    const el = document.createElement('div');
                    el.classList.add('folder-item');
                    el.innerHTML = `
                        <img src="${item.icon}" alt="folder"/>
                        <span>${item.name}</span>
                    `;
                    el.addEventListener('dblclick', () => createNewWindow(item));
                    grid.appendChild(el);
                });

                openMainWindow(app.name);
            } else {
                windowTitle.textContent = app.name;
                windowBody.innerHTML = app.content;
                openMainWindow(app.name); // Open main window for other apps
            }
        });
    });

    const projectCategories = [
        { 
            name: 'Motion Graphics', 
            icon: 'assets portfolio/additional assets/folder.png', 
            type: 'category', 
            subfolders: motionGraphicsProjects
        },
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
                    content: '<iframe src="assets portfolio/Branding/Razer Branding Project/razer project.pdf" style="width:100%; height:100%; border:none;"></iframe>'
                },
                {
                    name: 'Sweet Sentiments Branding Project',
                    icon: 'assets portfolio/additional assets/folder.png',
                    type: 'file',
                    content: '<iframe src="assets portfolio/Branding/Sweet Sentiment/branding sweet sentiments .pdf" style="width:100%; height:100%; border:none;"></iframe>'
                }
            ] 
        },
        { 
            name: 'CMS', 
            icon: 'assets portfolio/additional assets/folder.png', 
            type: 'category', 
            subfolders: [] 
        },
        { 
            name: 'Photography', 
            icon: 'assets portfolio/additional assets/folder.png', 
            type: 'category', 
            subfolders: [] 
        },
        { 
            name: 'Web Development', 
            icon: 'assets portfolio/additional assets/folder.png', 
            type: 'category', 
            subfolders: [
                {
                    name: 'Active Life Center',
                    icon: 'assets portfolio/additional assets/folder.png',
                    type: 'category',
                    subfolders: []
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
        }
    ];
       
    const folders = [
        { name: 'Portfolio', icon: 'assets portfolio/additional assets/folder.png', type: 'file', content: '<iframe src="assets portfolio/additional assets/portfolio.pdf" style="width:100%; height:100%; border:none;"></iframe>', x: 200, y: 300 },
        { name: 'Projects', icon: 'assets portfolio/additional assets/folder.png', type: 'category', subfolders: projectCategories, x: 800, y: 200 },
        { name: 'Resume.pdf', icon: 'assets portfolio/additional assets/folder.png', type: 'file', content: '<iframe src="assets portfolio/additional assets/Resume_Rishabh_Rawat.pdf" style="width:100%; height:100%; border:none;"></iframe>', x: 150, y: 500 }
    ];

    // Bring a window/folder to the front using a single shared z-index counter
    function bringWindowToFront(targetWindow) {
        currentZIndex++;
        targetWindow.style.zIndex = currentZIndex;
    }

    folders.forEach(folder => {
        const folderElement = document.createElement('div');
        folderElement.classList.add('folder');
        folderElement.innerHTML = `<img src="${folder.icon}" alt="folder"/><span>${folder.name}</span>`;
        folderElement.style.left = `${folder.x}px`;
        folderElement.style.top = `${folder.y}px`;
        desktop.appendChild(folderElement);
        console.log('Folder created:', folder.name, folderElement, 'position:', folderElement.style.left, folderElement.style.top);

        makeDraggable(folderElement);

        folderElement.addEventListener('dblclick', () => {
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
                const folderGrid = windowBody.querySelector('.folder-grid');
                
                projectCategories.forEach(subfolder => {
                    const subfolderElement = document.createElement('div');
                    subfolderElement.classList.add('folder-item');
                    subfolderElement.innerHTML = `
                        <img src="${subfolder.icon}" alt="folder"/>
                        <span>${subfolder.name}</span>
                    `;
                    
                    subfolderElement.addEventListener('dblclick', () => {
                        // Open the actual category/file, not a placeholder message
                        createNewWindow(subfolder);
                    });
                    
                    folderGrid.appendChild(subfolderElement);
                });
                openMainWindow(folder.name); // Open main window for Projects content
            } else {
                createNewWindow(folder.name, folder.content);
            }
        });
    });

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
        if (folderItem.type === 'category' && Array.isArray(folderItem.subfolders)) {
            newWindowBody.classList.remove('is-media');
            const folderGrid = document.createElement('div');
            folderGrid.classList.add('folder-grid');

            folderItem.subfolders.forEach(sub => {
                const subEl = document.createElement('div');
                subEl.classList.add('folder-item');
                subEl.innerHTML = `
                    <img src="${sub.icon}" alt="folder"/>
                    <span>${sub.name}</span>
                `;
                subEl.addEventListener('dblclick', () => createNewWindow(sub));
                folderGrid.appendChild(subEl);
            });

            newWindowBody.appendChild(folderGrid);
        } else {
            newWindowBody.innerHTML = folderItem.content || '';
            const hasMedia = !!newWindowBody.querySelector('iframe, video');
            newWindowBody.classList.toggle('is-media', hasMedia);
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
        let isDragging = false;
        let offsetX, offsetY;
        let currentElement = element;

        const handleMouseDown = (e) => {
            // Prevent dragging when clicking on child elements like images or text
            if (e.target !== currentElement && !currentElement.contains(e.target)) return;
            
            isDragging = true;
            offsetX = e.clientX - currentElement.offsetLeft;
            offsetY = e.clientY - currentElement.offsetTop;
            bringWindowToFront(currentElement); // Bring to front while dragging
            e.preventDefault(); // Prevent text selection while dragging
        };

        const handleMouseMove = (e) => {
            if (!isDragging) return;
            
            currentElement.style.left = `${e.clientX - offsetX}px`;
            currentElement.style.top = `${e.clientY - offsetY}px`;
        };

        const handleMouseUp = () => {
            if (isDragging) {
                isDragging = false;
            }
        };

        element.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
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
