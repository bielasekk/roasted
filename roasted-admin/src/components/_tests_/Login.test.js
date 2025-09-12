import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginPage from "../Login";

// Mock Header to avoid rendering it in tests
jest.mock("../Header", () => () => <div>Header</div>);

describe("Login", () => {
  let onLoginToggle;

  beforeEach(() => {
    onLoginToggle = jest.fn();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("renders login form", () => {
    render(<LoginPage isLoggedIn={false} onLoginToggle={onLoginToggle} />);

    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(screen.getByLabelText("Username")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
  });

  test("successful login calls onLoginToggle", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(<LoginPage isLoggedIn={false} onLoginToggle={onLoginToggle} />);

    fireEvent.change(screen.getByLabelText("Username"), { target: { value: "user1" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "pass123" } });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(onLoginToggle).toHaveBeenCalled();
    });
  });

  test("failed login shows error message", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ success: false, message: "Invalid credentials" }),
    });

    render(<LoginPage isLoggedIn={false} onLoginToggle={onLoginToggle} />);

    fireEvent.change(screen.getByLabelText("Username"), { target: { value: "user1" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "wrongpass" } });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    const alert = await screen.findByText("Invalid credentials");
    expect(alert).toBeInTheDocument();
    expect(onLoginToggle).not.toHaveBeenCalled();
  });

  test("network error shows error message", async () => {
    fetch.mockRejectedValueOnce(new Error("Network error"));

    render(<LoginPage isLoggedIn={false} onLoginToggle={onLoginToggle} />);

    fireEvent.change(screen.getByLabelText("Username"), { target: { value: "user1" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "pass123" } });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    const alert = await screen.findByText("Network error");
    expect(alert).toBeInTheDocument();
    expect(onLoginToggle).not.toHaveBeenCalled();
  });
});
