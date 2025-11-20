const express = require('express');
const path = require('path');
const os = require('os');

const app = express();
const PORT = 3000;

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Get network IP address
function getNetworkIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            // Skip internal (loopback) and non-IPv4 addresses
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'IP not found';
}

// Start server
app.listen(PORT, () => {
    const networkIP = getNetworkIP();
    console.log(`Your site is available locally at: http://localhost:${PORT}`);
    console.log(`Your site is available on your network at: http://${networkIP}:${PORT}`);
});
