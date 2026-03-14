import express from "express"
import cors from "cors"
import axios from "axios"

const app = express()

app.use(cors())
app.use(express.json())

// API KEY الخاص بك
const API_KEY = process.env.ARK_API_KEY


// تخزين أكواد الرصيد

const codes = {

"EAGLE20-A7F3K":{credits:20, used:false},

"EAGLE100-QW72K":{credits:100, used:false},

"EAGLE500-LS72K":{credits:500, used:false}

}


// توليد الصور

app.post("/generate", async (req,res)=>{

try{

const {prompt} = req.body

const response = await axios({

method:"POST",

url:"https://ark.ap-southeast.bytepluses.com/api/v3/images/generations",

headers:{
"Authorization":`Bearer ${API_KEY}`,
"Content-Type":"application/json"
},

data:{
model:"ep-20260227140001-vlp9z",
prompt:prompt,
size:"1024x1024"
}

})

res.json(response.data)

}catch(err){

console.log(err.response?.data || err.message)

res.status(500).json({
error:"generation_failed"
})

}

})


// تفعيل كود الرصيد

app.post("/activate-code",(req,res)=>{

const {code} = req.body

if(!codes[code]){

return res.json({
success:false,
message:"الكود غير صحيح"
})

}

if(codes[code].used){

return res.json({
success:false,
message:"تم استخدام الكود سابقاً"
})

}

codes[code].used = true

return res.json({
success:true,
credits:codes[code].credits
})

})


// تشغيل السيرفر

const PORT = process.env.PORT || 8080

app.listen(PORT,()=>{

console.log("AI server working on port",PORT)

})
