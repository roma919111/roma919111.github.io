const express = require("express")
const axios = require("axios")
const cors = require("cors")
const { createClient } = require("@supabase/supabase-js")

const app = express()

app.use(express.json())
app.use(cors())

const API_KEY = process.env.API_KEY

const supabase = createClient(
process.env.SUPABASE_URL,
process.env.SUPABASE_KEY
)



app.get("/", (req,res)=>{
res.send("AI Image Server Working")
})



app.post("/redeem", async (req,res)=>{

const {code,user} = req.body

const {data,error} = await supabase
.from("codes")
.select("*")
.eq("code",code)
.single()

if(!data || data.used){

return res.json({
success:false,
message:"الكود غير صالح"
})

}

await supabase
.from("codes")
.update({used:true})
.eq("code",code)


const {data:userData} = await supabase
.from("users")
.select("*")
.eq("id",user)
.single()


if(!userData){

await supabase
.from("users")
.insert({
id:user,
credits:data.credits
})

return res.json({
credits:data.credits
})

}


await supabase
.from("users")
.update({
credits:userData.credits + data.credits
})
.eq("id",user)

res.json({
credits:userData.credits + data.credits
})

})



app.post("/generate", async (req,res)=>{

const {prompt,user} = req.body


const {data:userData} = await supabase
.from("users")
.select("*")
.eq("id",user)
.single()


if(!userData || userData.credits <= 0){

return res.json({
error:"لا يوجد رصيد"
})

}


const response = await axios.post(
"https://ark.ap-southeast.bytepluses.com/api/v3/images/generations",
{
model:"ep-20260227140001-vlp9z",
prompt:prompt,
size:"2K",
response_format:"url",
stream:false,
watermark:true
},
{
headers:{
Authorization:"Bearer "+API_KEY,
"Content-Type":"application/json"
}
}
)


await supabase
.from("users")
.update({
credits:userData.credits - 1
})
.eq("id",user)


res.json({
image:response.data.data[0].url,
credits:userData.credits - 1
})

})


const PORT = process.env.PORT || 8080

app.listen(PORT,()=>{
console.log("Server running")
})
