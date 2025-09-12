import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import ReportTable from "../ReportTable";

// Mock fetch globally
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () =>
      Promise.resolve([
        {
          id: 1,
          text: "Abusive message",
          reporter: "User1",
          abusive_author: "Troll123",
          url: "Open",
          timestamp: "2025-09-08T12:00:00Z",
          flag: false,
        },
        {
          id: 2,
          text: "Spam content",
          reporter: "User2",
          abusive_author: "Spammer",
          url: "Open",
          timestamp: "2025-09-08T12:05:00Z",
          flag: true,
        },
      ]),
  })
);

beforeEach(() => {
  fetch.mockClear();
  window.confirm = jest.fn(() => true); // Auto-confirm deletions
});

test("renders report table with data", async () => {
  render(<ReportTable />);
  const row = await screen.findByText("Abusive message");
  expect(row).toBeInTheDocument();
});

test("search filters reports", async () => {
  render(<ReportTable />);
  const searchInput = await screen.findByPlaceholderText(/search reports/i);
  fireEvent.change(searchInput, { target: { value: "Spam" } });
  fireEvent.click(screen.getByText(/search/i));

  await waitFor(() => {
    expect(screen.getByText("Spam content")).toBeInTheDocument();
    expect(screen.queryByText("Abusive message")).not.toBeInTheDocument();
  });
});

test("toggle flag sends POST request", async () => {
  render(<ReportTable />);

  const row = await screen.findByText("Abusive message");
  const rowElement = row.closest('[role="row"]');

  const flagButton = within(rowElement)
    .getByTestId("OutlinedFlagIcon")
    .closest("button");
  fireEvent.click(flagButton);

  await waitFor(() => {
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/reports/flag"),
      expect.objectContaining({ method: "POST" })
    );
  });
});

test("delete reports sends DELETE request", async () => {
  render(<ReportTable />);

  // Wait for table row
  const row = await screen.findByText("Abusive message");
  const rowElement = row.closest('[role="row"]');

  // Select the checkbox
  const checkbox = within(rowElement).getByRole("checkbox");
  fireEvent.click(checkbox);

  const deleteButton = screen.getByText(/delete/i);
  fireEvent.click(deleteButton);

  await waitFor(() => {
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:5002/api/reports",
      expect.objectContaining({ method: "DELETE" })
    );
  });
});

test("clicking 'Open' calls window.open", async () => {
  window.open = jest.fn();
  render(<ReportTable />);

  const row = await screen.findByText("Abusive message");
  const rowElement = row.closest('[role="row"]');

  const openButton = within(rowElement).getByText("Open").closest("button");
  fireEvent.click(openButton);

  expect(window.open).toHaveBeenCalledWith("Open", "_blank", expect.any(String));
});
