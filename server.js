import express from "express"
import cors from "cors"
import fetch from "node-fetch"

const app = express()

app.use(cors())
app.use(express.json())

// API KEY
const API_KEY = process.env.ARK_API_KEY

// تخزين الرصيد
let users = {
  user1: 5000
}

// إنشاء الصورة
app.post("/generate", async (req, res) => {

  try {

    const { prompt, user } = req.body

    if (!users[user]) users[user] = 0

    if (users[user] <= 0) {
      return res.json({ error: "لا يوجد رصيد كافي" })
    }

    // خصم صورة
    users[user] -= 1

    const arabicText = prompt.trim()

    // PROMPT احترافي
    const finalPrompt = `
luxury perfume advertisement photo,
premium commercial photography,
perfume bottle centered,
clean elegant background,
beautiful gold arabic calligraphy saying "${arabicText}",
professional perfume marketing poster,
high end product photography
`

    const response = await fetch(
      "https://ark.ap-southeast.bytepluses.com/api/v3/images/generations",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "ep-20260227140001-vlp9z",
          prompt: finalPrompt,
          size: "1024x1024",
          response_format: "url"
        })
      }
    )

    const data = await response.json()

    if (!data.data || !data.data[0]) {
      return res.json({ error: "فشل توليد الصورة" })
    }

    const image = data.data[0].url

    res.json({
      image: image,
      credits: users[user]
    })

  } catch (err) {

    res.json({
      error: "حدث خطأ في السيرفر"
    })

  }

})

// تفعيل كود الرصيد
app.post("/redeem", (req, res) => {

  const { user, code } = req.body

  if (!users[user]) users[user] = 0

  if (code === "FREE100") {
    users[user] += 100
  }

  res.json({
    credits: users[user]
  })

})

app.listen(3000, () => {
  console.log("server running on port 3000")
})
