import { app, BrowserWindow, shell, Menu } from 'electron';

const isMac = process.platform === 'darwin';

export function createAppMenu(win: BrowserWindow) {
    const template: any = [
        // { role: 'appMenu' }
        ...(isMac
            ? [
                  {
                      label: app.name,
                      submenu: [
                          { role: 'about' },
                          { type: 'separator' },
                          { role: 'services' },
                          { type: 'separator' },
                          { role: 'hide' },
                          { role: 'hideOthers' },
                          { role: 'unhide' },
                          { type: 'separator' },
                          { role: 'quit' }
                      ]
                  }
              ]
            : []),
        // { role: 'fileMenu' }
        {
            label: 'File',
            submenu: [isMac ? { role: 'close' } : { role: 'quit' }]
        },
        // { role: 'editMenu' }
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                ...(isMac
                    ? [
                          { role: 'pasteAndMatchStyle' },
                          { role: 'delete' },
                          { role: 'selectAll' },
                          { type: 'separator' },
                          {
                              label: 'Speech',
                              submenu: [{ role: 'startSpeaking' }, { role: 'stopSpeaking' }]
                          }
                      ]
                    : [{ role: 'delete' }, { type: 'separator' }, { role: 'selectAll' }])
            ]
        },
        // { role: 'viewMenu' }
        {
            label: 'View',
            submenu: [
                { role: 'reload' },
                { role: 'forceReload' },
                { role: 'toggleDevTools' },
                { type: 'separator' },
                { role: 'resetZoom' },
                { role: 'zoomIn' },
                { role: 'zoomOut' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        },
        // { role: 'windowMenu' }
        {
            label: 'Window',
            submenu: [{ role: 'minimize' }, { role: 'zoom' }, ...(isMac ? [{ type: 'separator' }, { role: 'front' }, { type: 'separator' }, { role: 'window' }] : [{ role: 'close' }])]
        },
        {
            role: 'help',
            submenu: [
                {
                    label: 'Learn More',
                    click: async () => {
                        await shell.openExternal('https://electronjs.org');
                    }
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}


// export function createAppMenu(win: BrowserWindow) {
//   const template: Electron.MenuItemConstructorOptions[] = [
//     {
//       label: 'Menu',
//       submenu: [
//         {
//           label: 'Trang chủ',
//           click: () => {
//             win.webContents.send('navigate', '/');
//           },
//         },
//         {
//           label: 'Cài đặt',
//           click: () => {
//             win.webContents.send('navigate', '/settings');
//           },
//         },
//         { type: 'separator' },
//         { role: 'quit' },
//       ],
//     },
//   ];

//   const menu = Menu.buildFromTemplate(template);
//   Menu.setApplicationMenu(menu);
// }