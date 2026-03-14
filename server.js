const express = require("express")
const axios = require("axios")
const cors = require("cors")

const app = express()

app.use(express.json())
app.use(cors())

// ضع مفتاح Seedance هنا
const API_KEY = "04bb7d1-38c3-4c88-a805-509a7989baf0"


// اختبار السيرفر
app.get("/", (req, res) => {
  res.send("AI Image Server Working")
})


// توليد صورة
app.post("/generate", async (req, res) => {

  try {

    const prompt = req.body.prompt

    if (!prompt) {
      return res.json({ error: "Prompt is required" })
    }

    const response = await axios.post(
      "https://ark.ap-southeast.bytepluses.com/api/v3/images/generations",
      {
        model: "seedream-4-5",
        prompt: prompt,
        size: "1024x1024"
      },
      {
        headers: {
          Authorization: "Bearer " + API_KEY,
          "Content-Type": "application/json"
        }
      }
    )

    const image = response.data.data[0].url

    res.json({
      image: image
    })

  } catch (err) {

    console.log("ERROR:", err.response?.data || err.message)

    res.json({
      error: "Image generation failed"
    })

  }

})


const PORT = process.env.PORT || 8080

app.listen(PORT, () => {
  console.log("Server running on port " + PORT)
})
