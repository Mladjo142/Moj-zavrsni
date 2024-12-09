import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPEN_AI_API_KEY });

const extractMoviesWithDescriptions = (responseText) => {
  // Split the response by newline and filter lines that start with a number (movie list)
  const lines = responseText.split('\n');
  
  // Extract both movie titles and descriptions from each line
  const movies = lines
    .filter(line => /^\d+\.\s/.test(line)) // Find lines that start with a number
    .map(line => {
      // Extract the movie title and description
      const titleMatch = line.match(/"\s?(.+?)"\s?/); // Match the title in quotes
      const descriptionMatch = line.split(' - '); // Split by ' - ' to get the description

      if (titleMatch && descriptionMatch.length > 1) {
        const movieTitle = titleMatch[1];
        let movieDescription = descriptionMatch[1].split('IMDb rating:')[0].trim(); // Remove the IMDb rating part if present
        return { title: movieTitle, description: movieDescription };
      }
      return null;
    })
    .filter(movie => movie !== null); // Filter out null values

  return { movies };
};

export const registerOpenAIRoutes = (router) => {
  router.get("/getMovieRecommendation", async (ctx) => {
    try {
      const { userInput, rating } = ctx.query;
      // Modify the prompt to include the rating
      const prompt = `Možete li mi preporučiti neke filmove slične "${userInput}" s ocjenom od najmanje ${rating} zvjezdica na hrvatskom jeziku?`;

      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        model: "gpt-4",
      });

      const responseText = completion.choices[0].message.content;
      console.log(responseText);
      const movieRecommendations = extractMoviesWithDescriptions(responseText);

      // Return the list of movies with descriptions
      ctx.body = { recommendations: movieRecommendations };
    } catch (error) {
      console.error(error);
      ctx.body = { status: "error", message: "Something went wrong, please try again later!" };
    }
  });
};
