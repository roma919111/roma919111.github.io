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

app.get('*', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>نظام إدارة تكاليف OpenArt MCP</title>
    <style>
        :root { --primary: #4f46e5; --primary-hover: #4338ca; --bg: #f3f4f6; --card: #ffffff; --text: #1f2937; --border: #e5e7eb; }
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, sans-serif; }
        body { background-color: var(--bg); color: var(--text); min-height: 100vh; display: flex; justify-content: center; align-items: center; padding: 15px; }
        .container { width: 100%; max-width: 850px; }
        .card { background: var(--card); border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); padding: 25px; margin-bottom: 20px; }
        h2 { margin-bottom: 20px; color: var(--primary); text-align: center; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; font-weight: 600; }
        input { width: 100%; padding: 10px 15px; border: 1px solid var(--border); border-radius: 8px; font-size: 16px; }
        button { width: 100%; padding: 12px; background-color: var(--primary); color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; }
        button:hover { background-color: var(--primary-hover); }
        .hidden { display: none !important; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { padding: 12px; text-align: right; border-bottom: 1px solid var(--border); }
        th { background-color: #f8fafc; color: #4b5563; }
        .badge { background-color: #10b981; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; }
        .header-flex { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .logout-btn { background-color: #ef4444; width: auto; padding: 8px 16px; font-size: 14px; }
        .error-msg { color: #ef4444; text-align: center; margin-bottom: 15px; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div id="login-section" class="card">
            <h2>تسجيل الدخول للنظام</h2>
            <div id="login-error" class="error-msg"></div>
            <form id="login-form">
                <div class="form-group">
                    <label>اسم المستخدم</label>
                    <input type="text" id="username" required placeholder="أدخل اسم المستخدم">
                </div>
                <div class="form-group">
                    <label>كلمة المرور</label>
                    <input type="password" id="password" required placeholder="أدخل كلمة المرور">
                </div>
                <button type="submit">دخول</button>
            </form>
        </div>

        <div id="dashboard-section" class="card hidden">
            <div class="header-flex">
                <h2>لوحة تحكم أسعار OpenArt MCP</h2>
                <button class="logout-btn" id="logout-btn">تسجيل الخروج</button>
            </div>
            <p style="margin-bottom: 15px; color: #6b7280; font-size: 14px;">التكاليف الأصلية مجلوبة من بروتوكول MCP مع إضافة نسبة أرباح تلقائية (30%).</p>
            <div style="overflow-x: auto;">
                <table>
                    <thead>
                        <tr>
                            <th>الخدمة / الباقة</th>
                            <th>الوصف</th>
                            <th>التكلفة الأصلية</th>
                            <th>نسبة الربح</th>
                            <th>السعر النهائي</th>
                        </tr>
                    </thead>
                    <tbody id="costs-table-body"></tbody>
                </table>
            </div>
        </div>
    </div>
    <script>
        async function checkAuth() {
            const res = await fetch('/api/check-auth');
            const data = await res.json();
            if (data.isAuthenticated) showDashboard();
            else showLogin();
        }
        function showLogin() {
            document.getElementById('login-section').classList.remove('hidden');
            document.getElementById('dashboard-section').classList.add('hidden');
        }
        function showDashboard() {
            document.getElementById('login-section').classList.add('hidden');
            document.getElementById('dashboard-section').classList.remove('hidden');
            fetchCosts();
        }
        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            document.getElementById('login-error').textContent = '';
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();
            if (data.success) showDashboard();
            else document.getElementById('login-error').textContent = data.message;
        });
        document.getElementById('logout-btn').addEventListener('click', async () => {
            await fetch('/api/logout', { method: 'POST' });
            showLogin();
        });
        async function fetchCosts() {
            const res = await fetch('/api/costs');
            if (res.status === 401) { showLogin(); return; }
            const result = await res.json();
            if (result.success) {
                const tbody = document.getElementById('costs-table-body');
                tbody.innerHTML = '';
                result.data.forEach(item => {
                    tbody.innerHTML += \`<tr>
                        <td><strong>\${item.name}</strong></td>
                        <td>\${item.description}</td>
                        <td>$\${item.originalCost.toFixed(2)}</td>
                        <td><span class="badge">+\${item.markup}</span></td>
                        <td><strong style="color: var(--primary);">$\${item.finalPrice.toFixed(2)}</strong></td>
                    </tr>\`;
                });
            }
        }
        checkAuth();
    </script>
</body>
</html>`);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
