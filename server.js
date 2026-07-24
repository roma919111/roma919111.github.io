const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// إعدادات الجلسة
app.use(session({
    secret: 'openart-mcp-secret-key-2026',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// خدمة الملفات من المجلد الرئيسي مباشرة (بدون مجلد public)
app.use(express.static(__dirname));

// بيانات الدخول
const USER_CREDENTIALS = {
    username: 'admin',
    password: 'password123'
};

// مسارات الـ API
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === USER_CREDENTIALS.username && password === USER_CREDENTIALS.password) {
        req.session.user = username;
        return res.json({ success: true });
    }
    res.status(401).json({ success: false, message: 'بيانات الدخول خاطئة' });
});

app.get('/api/data', (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'يرجى تسجيل الدخول' });
    
    const tools = [
        { name: 'Image Generation', baseCost: 10.00, description: 'توليد صور عالية الجودة' },
        { name: 'Video Editing', baseCost: 50.00, description: 'تحرير فيديو احترافي' }
    ];

    const processed = tools.map(t => ({
        ...t,
        profitAmount: (t.baseCost * 0.3).toFixed(2),
        finalPrice: (t.baseCost * 1.3).toFixed(2)
    }));
    
    res.json(processed);
});

// توجيه لملف Index.html الموجود في المجلد الرئيسي
app.get('*', (req, res) => {
    // لاحظ استخدام 'Index.html' بحرف I كبير كما هو في ملفاتك
    res.sendFile(path.join(__dirname, 'Index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
