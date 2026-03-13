app.post("/generate", async (req, res) => {
  try {
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

    // 👇 هذه السطور للتشخيص
    console.log("API STATUS:", response.status);
    console.log("API RESPONSE:", data);

    res.json(data);

  } catch (error) {
    console.log("SERVER ERROR:", error);
    res.status(500).json({ error: "generation failed" });
  }
});
