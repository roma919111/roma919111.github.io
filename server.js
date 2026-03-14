const express = require("express")
const axios = require("axios")
const cors = require("cors")
const { createClient } = require("@supabase/supabase-js")

const app = express()

app.use(express.json())
app.use(cors())

const API_KEY = process.env.API_KEY
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_KEY

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

app.get("/", (req, res) => {
  res.send("AI server working")
})

app.get("/credits/:user", async (req, res) => {
  try {
    const user = req.params.user

    const { data: userData } = await supabase
      .from("users")
      .select("*")
      .eq("id", user)
      .single()

    if (!userData) {
      return res.json({ credits: 0 })
    }

    res.json({ credits: userData.credits })
  } catch (err) {
    console.log(err)
    res.json({ credits: 0 })
  }
})

app.post("/redeem", async (req, res) => {
  try {
    const { user, code } = req.body

    const { data: codeData, error } = await supabase
      .from("codes")
      .select("*")
      .eq("code", code)
      .single()

    if (error || !codeData) {
      return res.json({ error: "invalid code" })
    }

    if (codeData.used) {
      return res.json({ error: "code already used" })
    }

    await supabase
      .from("codes")
      .update({ used: true })
      .eq("code", code)

    const { data: userData } = await supabase
      .from("users")
      .select("*")
      .eq("id", user)
      .single()

    if (!userData) {
      await supabase
        .from("users")
        .insert({
          id: user,
          credits: codeData.credits
        })

      return res.json({ credits: codeData.credits })
    }

    const newCredits = userData.credits + codeData.credits

    await supabase
      .from("users")
      .update({ credits: newCredits })
      .eq("id", user)

    res.json({ credits: newCredits })
  } catch (err) {
    console.log(err)
    res.json({ error: "redeem failed" })
  }
})

app.post("/generate", async (req, res) => {
  try {
    const { prompt, user, size } = req.body

    const { data: userData } = await supabase
      .from("users")
      .select("*")
      .eq("id", user)
      .single()

    if (!userData || userData.credits <= 0) {
      return res.json({ error: "no credits" })
    }

    const response = await axios.post(
      "https://ark.ap-southeast.bytepluses.com/api/v3/images/generations",
      {
        model: "ep-20260227140001-vlp9z",
        prompt: prompt,
        size: size || "1024x1024",
        response_format: "url"
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    )

    const imageUrl = response.data.data[0].url
    const newCredits = userData.credits - 1

    await supabase
      .from("users")
      .update({
        credits: newCredits
      })
      .eq("id", user)

    res.json({
      image: imageUrl,
      credits: newCredits
    })
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
})





// توليد الصورة
app.post("/generate", async (req, res) => {

  try {

    const { prompt, user, size } = req.body



    const { data: userData } = await supabase
      .from("users")
      .select("*")
      .eq("id", user)
      .single()



    if (!userData || userData.credits <= 0) {

      return res.json({ error: "no credits" })

    }



    const response = await axios.post(

      "https://ark.ap-southeast.bytepluses.com/api/v3/images/generations",

      {
        model: "ep-20260227140001-vlp9z",
        prompt: prompt,
        size: size || "1024x1024",
        response_format: "url"
      },

      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json"
        }
      }

    )



    const imageUrl = response.data.data[0].url



    const newCredits = userData.credits - 1



    await supabase
      .from("users")
      .update({
        credits: newCredits
      })
      .eq("id", user)



    res.json({

      image: imageUrl,
      credits: newCredits

    })

  }

  catch (err) {

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
  try {

    const { prompt, user } = req.body

    const { data: userData } = await supabase
      .from("users")
      .select("*")
      .eq("id", user)
      .single()

    if (!userData || userData.credits <= 0) {
      return res.json({
        error: "no credits"
      })
    }


    const response = await axios.post(
      "https://ark.ap-southeast.bytepluses.com/api/v3/images/generations",
      {
        model: "ep-20260227140001-vlp9z",
        prompt: prompt,
        size: "2K",
        response_format: "url"
      },
      {
        headers: {
          Authorization: "Bearer " + API_KEY,
          "Content-Type": "application/json"
        }
      }
    )


    const newCredits = userData.credits - 1

    await supabase
      .from("users")
      .update({
        credits: newCredits
      })
      .eq("id", user)


    res.json({
      image: response.data.data[0].url,
      credits: newCredits
    })

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
