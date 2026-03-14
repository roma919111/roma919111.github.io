import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY;

app.get("/", (req, res) => {
  res.send("AI server working");
});

app.post("/generate", async (req, res) => {
  try {
    const { prompt } = req.body;

    const response = await fetch(
      "https://ark.ap-southeast.bytepluses.com/api/v3/images/generations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: "ep-20260227140001-vlp9z",
          prompt: prompt,
          size: "1024x1024",
        }),
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "generation failed" });
  }
});

app.listen(PORT, () => {
  console.log("server running");
});
