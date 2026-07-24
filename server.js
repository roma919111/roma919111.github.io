const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
    let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
    
    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end('<h1>الصفحة غير موجودة</h1>');
        } else {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});





// توليد الصورة
app.post("/generate", async (req, res) => { 

  try { 

    const { prompt, user, size } = req.body   // ⭐ التعديل هنا 

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
        size: size || "2K",   // ⭐ استخدام المقاس من الواجهة
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
