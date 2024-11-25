import { Request, Response } from "express";
import tmdbClient from "../utils/tmdbClient";

// TypeScript interfaces for better type safety
interface Movie {
  id: number;
  title: string;
  release_date: string;
  vote_average: number;
}

interface Editor {
  known_for_department: string;
  name: string;
}

export const getMoviesByYear = async (req: Request, res: Response): Promise<void> => {
  const { year, page = 1 } = req.query;

  // Validate the 'year' parameter
  if (!year || isNaN(Number(year))) {
    res.status(400).json({ message: "Year is required and must be a valid number." });
    return;
  }

  try {
    // Fetch movies using the TMDb discover API
    const moviesResponse = await tmdbClient.get("/discover/movie", {
      params: {
        language: "en-US",
        page,
        primary_release_year: year,
        sort_by: "popularity.desc",
      },
    });

    const movies = await Promise.all(
      moviesResponse.data.results.map(async (movie: Movie) => {
        let editors: string[] = [];
        try {
          // Fetch credits for each movie
          const creditsResponse = await tmdbClient.get(`/movie/${movie.id}/credits`);
          editors = creditsResponse.data.crew
            .filter((crewMember: Editor) => crewMember.known_for_department === "Editing")
            .map((editor: Editor) => editor.name);
        } catch (err) {
            if (err instanceof Error) {
                console.error("Failed to fetch movies:", err.message);
                res.status(500).json({ message: err.message });
              } else {
                console.error("Unknown error:", err);
                res.status(500).json({ message: "An unknown error occurred." });
              }
        }

        // Return the processed movie data
        return {
          title: movie.title || "Unknown Title",
          release_date: movie.release_date || "Unknown Release Date",
          vote_average: movie.vote_average || 0,
          editors,
        };
      })
    );

    res.status(200).json(movies);
  } catch (err) {
    console.error("Error fetching movies:", err);
    res.status(500).json({ message: err instanceof Error ? err.message : "An unknown error occurred." });
  }
};
