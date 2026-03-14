const express = require("express")
const axios = require("axios")
const cors = require("cors")

const app = express()

app.use(express.json())
app.use(cors())

// قراءة API KEY من Railway
const API_KEY = process.env.API_KEY


// اختبار السيرفر
app.get("/", (req,res)=>{
res.send("AI Image Server Working")
})


// توليد صورة
app.post("/generate", async (req,res)=>{

try{

const prompt = req.body.prompt

const response = await axios.post(
"https://ark.ap-southeast.bytepluses.com/api/v3/images/generations",
{
model: "ep-20260227140001-vlp9z",
prompt: prompt,
sequential_image_generation: "disabled",
response_format: "url",
size: "2K",
stream: false,
watermark: false
},
{
headers:{
Authorization:`Bearer ${API_KEY}`,
"Content-Type":"application/json"
}
}
)

res.json(response.data)

}catch(err){

console.log("IMAGE ERROR")
console.log(err.response?.data || err.message)

res.json({
error:"generation failed"
})

}

})



// استقبال Webhook من سلة
app.post("/webhook",(req,res)=>{

console.log("====== SALLA WEBHOOK RECEIVED ======")

console.log(JSON.stringify(req.body,null,2))

// استخراج معلومات الطلب
const order = req.body.data || {}

const email = order.customer?.email || "unknown"

const items = order.items || []

let credits = 0

items.forEach(item=>{

const name = item.name || ""

if(name.includes("20")) credits += 20
if(name.includes("100")) credits += 100
if(name.includes("500")) credits += 500

})

console.log("Customer Email:",email)
console.log("Credits To Add:",credits)


// هنا لاحقاً سنضيف قاعدة بيانات للرصيد

res.send("ok")

})



// تشغيل السيرفر
const PORT = process.env.PORT || 8080

app.listen(PORT,()=>{

console.log("Server running on port "+PORT)

})
