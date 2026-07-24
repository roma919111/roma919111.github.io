const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'admin123';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'openart_secure_key_2026',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

function isAuthenticated(req, res, next) {
    if (req.session && req.session.isAuthenticated) {
        return next();
    }
    res.status(401).json({ error: 'Unauthorized' });
}

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USER && password === ADMIN_PASS) {
        req.session.isAuthenticated = true;
        return res.json({ success: true });
    }
    res.status(401).json({ success: false, message: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
});

app.post('/api/logout', (req, res) => {
    req.session.destroy(() => {
        res.json({ success: true });
    });
});

app.get('/api/check-auth', (req, res) => {
    res.json({ isAuthenticated: !!(req.session && req.session.isAuthenticated) });
});

app.get('/api/costs', isAuthenticated, async (req, res) => {
    try {
        const fetch = (await import('node-fetch')).default;
        const response = await fetch('https://mcp.openart.ai/mcp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ jsonrpc: "2.0", method: "tools/list", params: {}, id: 1 })
        });

        let items = [];
        if (response.ok) {
            const data = await response.json();
            items = data.result || data.items || [];
        }

        if (items.length === 0) {
            items = [
                { name: "توليد صور قياسي (Standard)", description: "تكلفة الاعتماد من OpenArt MCP", cost: 5.00 },
                { name: "توليد عالي الدقة (HD Model)", description: "معالجة فائقة الجودة عبر بروتوكول MCP", cost: 12.00 },
                { name: "حزمة اشتراك شهرية (Pro Plan)", description: "باقة مخصصة للاستخدام التجاري", cost: 40.00 }
            ];
        }

        const processedItems = items.map(item => {
            const originalCost = item.cost || item.price || 10.00;
            const finalPrice = Number((originalCost * 1.30).toFixed(2));
            return {
                name: item.name || 'خدمة OpenArt',
                description: item.description || 'تنسيق وتوليد بيانات من بروتوكول MCP',
                originalCost: originalCost,
                finalPrice: finalPrice,
                markup: '30%'
            };
        });

        res.json({ success: true, data: processedItems });

    } catch (error) {
        const fallbackData = [
            { name: "توليد صور قياسي (Standard)", description: "تكلفة الاعتماد من OpenArt MCP", originalCost: 5.00, finalPrice: 6.50, markup: "30%" },
            { name: "توليد عالي الدقة (HD Model)", description: "معالجة فائقة الجودة عبر بروتوكول MCP", originalCost: 12.00, finalPrice: 15.60, markup: "30%" },
            { name: "حزمة اشتراك شهرية (Pro Plan)", description: "باقة مخصصة للاستخدام التجاري", originalCost: 40.00, finalPrice: 52.00, markup: "30%" }
        ];
        res.json({ success: true, data: fallbackData });
    }
});

// قراءة ملف index.html من نفس المجلد الرئيسي
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
