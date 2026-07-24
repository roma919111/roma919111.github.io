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

// خدمة الملفات الثابتة - تم التصحيح هنا ليعمل على Railway
app.use(express.static(path.join(__dirname, 'public')));

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
    
    // بيانات تجريبية مع حساب الربح 30%
    const tools = [
        { name: 'Image Generation', baseCost: 10.00, description: 'توليد صور' },
        { name: 'Video Editing', baseCost: 50.00, description: 'تحرير فيديو' }
    ];

    const processed = tools.map(t => ({
        ...t,
        profitAmount: (t.baseCost * 0.3).toFixed(2),
        finalPrice: (t.baseCost * 1.3).toFixed(2)
    }));
    
    res.json(processed);
});

// توجيه للواجهة
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

    } catch (error) {
        console.error('خطأ في جلب البيانات من MCP:', error);
        res.status(500).json({ 
            error: 'حدث خطأ أثناء معالجة البيانات من OpenArt MCP',
            details: error.message 
        });
    } finally {
        // إغلاق الاتصال إذا كان مفتوحاً
        // await client.close();
    }
});

// توجيه كافة الطلبات الأخرى لملف Index.html (لخدمة SPA أو الواجهة)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// بدء تشغيل السيرفر
app.listen(PORT, () => {
    console.log(`السيرفر يعمل الآن على البورت: ${PORT}`);
    console.log(`رابط الوصول المحلي: http://localhost:${PORT}`);
});
