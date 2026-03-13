import express from "express";
import fetch from "node-fetch";

const app = express();

app.use(express.json());

app.post("/generate", async (req, res) => {

  const prompt = req.body.prompt;

  const response = await fetch(
    "https://ark.ap-southeast.bytepluses.com/api/v3/images/generations",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer 048b77d1-38c3-4c88-a805-509a7989baf0"
      },
      body: JSON.stringify({
        model: "seedream-4.5",
        prompt: prompt,
        size: "1024x1024"
      })
    }
  );

  const data = await response.json();

  res.json(data);

});

app.listen(3000, () => {
  console.log("Server running");
});
