import express from "express"
import cors from "cors"
import fetch from "node-fetch"

const app = express()

app.use(cors())
app.use(express.json())

// API KEY
const API_KEY = process.env.ARK_API_KEY

// credits
let users = {
  "user1": 5000
}

// توليد الصورة
app.post("/generate", async (req, res) => {

  try {

    const { prompt, user } = req.body

    if (!users[user]) users[user] = 0

    if (users[user] <= 0) {
      return res.json({ error: "لا يوجد رصيد كافي" })
    }

    // تقليل الرصيد
    users[user] -= 1

    // PROMPT احترافي للخط العربي
    const finalPrompt = `
luxury advertisement photo,
high end commercial photography,
product centered,
clean background,
professional lighting,
Arabic calligraphy text "${prompt}",
beautiful elegant Arabic typography,
gold Arabic lettering,
clear readable Arabic words,
perfume advertisement design,
premium marketing poster
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
          size: "1024x1024"
        })
      }
    )

    const data = await response.json()

    const image = data.data[0].url

    res.json({
      image: image,
      credits: users[user]
    })

  } catch (err) {

    res.json({ error: "خطأ في إنشاء الصورة" })

  }

})

// تفعيل الكود
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
  console.log("server running")
})
