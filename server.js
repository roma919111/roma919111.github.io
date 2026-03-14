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


// اختبار السيرفر
app.get("/", (req, res) => {
  res.send("AI server working")
})



// تفعيل كود الرصيد
app.post("/redeem", async (req, res) => {

  try {

    const { user, code } = req.body

    const { data: codeData } = await supabase
      .from("codes")
      .select("*")
      .eq("code", code)
      .single()

    if (!codeData || codeData.used) {
      return res.json({ error: "الكود غير صالح" })
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




// توليد صورة مع خصم رصيد
app.post("/generate", async (req, res) => {

  try {

    const { prompt, user } = req.body

    const { data: userData } = await supabase
      .from("users")
      .select("*")
      .eq("id", user)
      .single()

    if (!userData || userData.credits <= 0) {
      return res.json({ error: "لا يوجد رصيد" })
    }


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


    const newCredits = userData.credits - 1

    await supabase
      .from("users")
      .update({ credits: newCredits })
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
