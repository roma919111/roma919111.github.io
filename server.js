const express = require('express');
const session = require('express-session');
const path = require('path');

// ملاحظة: في نسخ Node.js الحديثة (18+) fetch مدمج تلقائياً.
// إذا كنت تستخدم نسخة أقدم، ستحتاج لتثبيت node-fetch.

const app = express();
const PORT = process.env.PORT || 3000;

// إعدادات الجلسة (Session)
app.use(session({
    secret: 'openart-mcp-secret-key-2026', // يجب تغيير هذا في الإنتاج ليكون أكثر تعقيداً
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // اجعله true في حال استخدام HTTPS
}));

// معالجة بيانات النماذج (Body Parser)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// خدمة الملفات الثابتة (Static Files)
app.use(express.static(path.join(__currentDir, 'public')));

// بيانات تجريبية لتسجيل الدخول (يمكن استبدالها بقاعدة بيانات لاحقاً)
const USER_CREDENTIALS = {
    username: 'admin',
    password: 'password123'
};

// Middleware للتحقق من الجلسة
const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return next();
    }
    res.status(401).json({ error: 'غير مصرح لك بالوصول. يرجى تسجيل الدخول.' });
};

// مسار تسجيل الدخول
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    if (username === USER_CREDENTIALS.username && password === USER_CREDENTIALS.password) {
        req.session.user = username;
        return res.json({ success: true, message: 'تم تسجيل الدخول بنجاح' });
    }
    
    res.status(401).json({ success: false, message: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
});

// مسار تسجيل الخروج
app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

// مسار جلب البيانات مع الحسابات الدقيقة (30% ربح)
app.get('/api/data', isAuthenticated, async (req, res) => {
    try {
        // مثال لطلب بيانات من مصدر خارجي (OpenArt MCP أو API خارجي)
        // سنستخدم هنا بيانات وهمية لمحاكاة الاستجابة في حال لم يتوفر رابط API فعلي
        const mockExternalData = [
            { id: 1, name: 'باقة المبتدئين', originalCost: 10.00, description: 'دعم فني محدود' },
            { id: 2, name: 'الباقة الاحترافية', originalCost: 50.00, description: 'دعم فني 24/7' },
            { id: 3, name: 'باقة الشركات', originalCost: 200.00, description: 'خوادم مخصصة' }
        ];

        // في حال كان لديك API فعلي، يمكنك استبدال الكود أعلاه بـ:
        // const response = await fetch('https://api.example.com/data');
        // const mockExternalData = await response.json();

        const profitMargin = 0.30; // 30% نسبة الربح

        const processedData = mockExternalData.map(item => {
            const finalPrice = item.originalCost * (1 + profitMargin);
            return {
                ...item,
                profitAmount: (item.originalCost * profitMargin).toFixed(2),
                finalPrice: finalPrice.toFixed(2)
            };
        });

        res.json(processedData);

    } catch (error) {
        console.error('خطأ في جلب البيانات:', error);
        // معالجة آمنة للأخطاء لضمان عدم توقف السيرفر
        res.status(500).json({ 
            error: 'حدث خطأ أثناء معالجة البيانات من المصدر الخارجي',
            details: error.message 
        });
    }
});

// توجيه كافة الطلبات الأخرى لملف Index.html (لخدمة SPA أو الواجهة)
app.get('*', (req, res) => {
    res.sendFile(path.join(__currentDir, 'public', 'index.html'));
});

// بدء تشغيل السيرفر
app.listen(PORT, () => {
    console.log(`السيرفر يعمل الآن على البورت: ${PORT}`);
    console.log(`رابط الوصول المحلي: http://localhost:${PORT}`);
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
