import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Statistics, { extractDomain, getLast7Days } from "../Statistics";

// Mock fetch
global.fetch = jest.fn();

describe("Utility functions", () => {
  test("extractDomain returns domain without www", () => {
    expect(extractDomain("https://www.google.com/page")).toBe("google.com");
    expect(extractDomain("http://example.org/test")).toBe("example.org");
  });

  test("extractDomain returns null for invalid URL", () => {
    expect(extractDomain("not-a-url")).toBeNull();
  });

  test("getLast7Days returns 7 date strings", () => {
    const result = getLast7Days();
    expect(result).toHaveLength(7);
    result.forEach((d) => {
      expect(d).toMatch(/^\d{2}\.\d{2}$/);
    });
  });
});

describe("Statistics component", () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test("shows loading spinner initially", () => {
    fetch.mockResolvedValueOnce({ json: async () => [] });
    render(<Statistics />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  test("renders stats with 0 values when API returns empty array", async () => {
    fetch.mockResolvedValueOnce({ json: async () => [] });
    render(<Statistics />);
    await waitFor(() => {
      expect(screen.getByText("Total Reports")).toBeInTheDocument();
    });
    expect(screen.getAllByText("0")[0]).toBeInTheDocument(); 
  });

  test("renders statistics correctly with sample data", async () => {
    const today = new Date();
    const recentDate = today.toISOString();

    const mockReports = [
      { timestamp: recentDate, flag: true, reporter: "Anonymous", url: "https://test.com/page" },
      { timestamp: recentDate, flag: false, reporter: "User1", url: "https://example.com" },
      { timestamp: recentDate, flag: false, reporter: "Anonymous" },
    ];

    fetch.mockResolvedValueOnce({ json: async () => mockReports });

    render(<Statistics />);

    // Wait for metrics to appear
    await waitFor(() => {
      expect(screen.getByText("Total Reports")).toBeInTheDocument();
    });

    // Table checks
    expect(screen.getByText("Flagged Reports")).toBeInTheDocument();
    expect(screen.getByText(/1 \(33.3%\)/)).toBeInTheDocument();

    expect(screen.getByText("Average Reports per Day")).toBeInTheDocument();
    expect(screen.getByText("0.4")).toBeInTheDocument(); // 3/7 = 0.43 → 0.4

    expect(screen.getByText("Anonymous Reports")).toBeInTheDocument();
    expect(screen.getByText("66.7%")).toBeInTheDocument();

    // Top domains
    expect(screen.getByText("Top Domains")).toBeInTheDocument();
    expect(screen.getByText("test.com")).toBeInTheDocument();
    expect(screen.getByText("example.com")).toBeInTheDocument();


    expect(screen.getAllByText("3").some((el) => el.tagName === "TD")).toBe(true);
  });

  test("renders 'No domains' when no URLs are present", async () => {
    const mockReports = [{ timestamp: new Date().toISOString(), flag: false, reporter: "User1" }];
    fetch.mockResolvedValueOnce({ json: async () => mockReports });

    render(<Statistics />);
    await waitFor(() => {
      expect(screen.getByText("No domains")).toBeInTheDocument();
    });
  });

  test("handles fetch error gracefully", async () => {
    fetch.mockRejectedValueOnce(new Error("API down"));
    render(<Statistics />);
    await waitFor(() => {
      // With error, stats remain null 
      expect(screen.getByText("No data")).toBeInTheDocument();
    });
  });
});
