const express = require("express")
const axios = require("axios")
const cors = require("cors")

const app = express()

app.use(express.json())
app.use(cors())

const API_KEY = process.env.API_KEY


// اختبار السيرفر
app.get("/", (req, res) => {
res.send("AI Image Server Working")
})


// توليد صورة
app.post("/generate", async (req, res) => {

try {

const prompt = req.body.prompt

const response = await axios.post(
"https://ark.ap-southeast.bytepluses.com/api/v3/images/generations",
{
model: "ep-20260227140001-vlp9z",
prompt: prompt,
size: "2K",
response_format: "url",
stream: false,
watermark: true
},
{
headers: {
Authorization: "Bearer " + API_KEY,
"Content-Type": "application/json"
}
}
)

res.json(response.data)

} catch (err) {

console.log(err.response?.data || err.message)

res.json({
error: "generation failed"
})

}

})

const PORT = process.env.PORT || 8080

app.listen(PORT, () => {
console.log("Server running on port " + PORT)
})
