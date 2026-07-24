import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// MCP SDK imports
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// إعدادات الجلسة (Session)
app.use(session({
    secret: 'openart-mcp-secure-key-2026', // يجب تغيير هذا في الإنتاج ليكون أكثر تعقيداً
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // اجعله true في حال استخدام HTTPS
}));

// معالجة بيانات النماذج (Body Parser)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// خدمة الملفات الثابتة (Static Files)
app.use(express.static(path.join(__dirname, 'public')));

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
    const MCP_URL = 'https://mcp.openart.ai/mcp';
    
    const client = new Client({
        name: "openart-mcp-client",
        version: "1.0.0",
    });

    const transport = new StreamableHTTPClientTransport(new URL(MCP_URL));

    try {
        // في بيئة حقيقية، ستحتاج لمصادقة OAuth، ولكن هنا سنقوم بمحاكاة جلب الأدوات (Tools)
        // التي يقدمها السيرفر وتطبيق معادلة الربح (30%) على تكاليفها الافتراضية.
        // await client.connect(transport);
        
        const tools = [
            { name: 'Image Generation', baseCost: 0.05, description: 'توليد صور عالية الجودة' },
            { name: 'Video Editing', baseCost: 0.50, description: 'تحرير الفيديو بالذكاء الاصطناعي' },
            { name: 'Upscaling', baseCost: 0.02, description: 'رفع جودة الصور' }
        ];

        const profitMargin = 0.30;
        const processedData = tools.map(tool => {
            const finalPrice = tool.baseCost * (1 + profitMargin);
            return {
                name: tool.name,
                description: tool.description,
                originalCost: tool.baseCost,
                profitAmount: (tool.baseCost * profitMargin).toFixed(2),
                finalPrice: finalPrice.toFixed(2)
            };
        });

        res.json(processedData);

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
