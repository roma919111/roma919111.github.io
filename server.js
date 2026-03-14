import express from "express"
import cors from "cors"
import fetch from "node-fetch"

const app = express()

app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 3000
const API_KEY = process.env.ARK_API_KEY


app.get("/", (req,res)=>{
res.send("AI server working")
})


app.post("/generate", async (req,res)=>{

try{

const { prompt } = req.body

const response = await fetch(
"https://ark.ap-southeast.bytepluses.com/api/v3/images/generations",
{
method:"POST",
headers:{
"Content-Type":"application/json",
"Authorization":`Bearer ${API_KEY}`
},
body:JSON.stringify({

model:"ep-20260227140001-vlp9z",

input:{
prompt:prompt
},

size:"2K"

})
}
)

const data = await response.json()

const image = data.data?.[0]?.url

res.json({
image:image
})

}catch(error){

console.log(error)

res.status(500).json({
error:"generation failed"
})

}

})

app.listen(PORT,()=>{
console.log("server running")
})
