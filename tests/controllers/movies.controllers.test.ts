import { Request, Response } from "express";
import { getMoviesByYear } from "../../src/controllers/movies.controller";
import tmdbClient from "../../src/utils/tmdbClient"; // Mock this
import MockAdapter from "axios-mock-adapter";

// Mock the TMDb client
const mockTMDb = new MockAdapter(tmdbClient);

describe("getMoviesByYear", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    // Mock request and response
    mockRequest = {
      query: {},
    };
    statusMock = jest.fn();
    jsonMock = jest.fn();
    mockResponse = {
      status: statusMock.mockReturnThis(),
      json: jsonMock,
    };
    mockTMDb.reset();
  });

  it("should return 400 if year is not provided", async () => {
    mockRequest.query = {};

    await getMoviesByYear(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      message: "Year is required and must be a valid number.",
    });
  });

  it("should fetch and return movies for a valid year", async () => {
    // Mock discover movies response
    mockTMDb.onGet("/discover/movie").reply(200, {
      results: [
        {
          id: 1,
          title: "Movie 1",
          release_date: "2023-01-01",
          vote_average: 8.5,
        },
      ],
    });

    // Mock credits API response
    mockTMDb.onGet("/movie/1/credits").reply(200, {
      crew: [
        { known_for_department: "Editing", name: "Editor 1" },
        { known_for_department: "Editing", name: "Editor 2" },
      ],
    });

    mockRequest.query = { year: "2023", page: "1" };

    await getMoviesByYear(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith([
      {
        title: "Movie 1",
        release_date: "2023-01-01",
        vote_average: 8.5,
        editors: ["Editor 1", "Editor 2"],
      },
    ]);
  });

  it("should handle errors from the TMDb API gracefully", async () => {
    // Mock discover movies response with failure
    mockTMDb.onGet("/discover/movie").reply(500);

    mockRequest.query = { year: "2023", page: "1" };

    await getMoviesByYear(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      message: "Request failed with status code 500",
    });
  });
});
