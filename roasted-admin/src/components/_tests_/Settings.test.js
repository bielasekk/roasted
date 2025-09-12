import { render, screen, fireEvent } from "@testing-library/react";
import Settings from "../Settings";

// Mock fetch globally
beforeEach(() => {
  global.fetch = jest.fn();
  jest.clearAllMocks();
});

describe("Settings component", () => {

  test("updates email successfully", async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    render(<Settings />);

    fireEvent.change(screen.getByLabelText(/Old Email/i), {
      target: { value: "old@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/New Email/i), {
      target: { value: "new@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Update Email/i }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/Email updated successfully!/i);
  });

  test("handles email update error", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Failed to change email" }),
    });
    render(<Settings />);

    fireEvent.change(screen.getByLabelText(/Old Email/i), {
      target: { value: "old@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/New Email/i), {
      target: { value: "new@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Update Email/i }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/Failed to change email/i);
  });

  test("shows error if passwords do not match", async () => {
    render(<Settings />);

    fireEvent.change(screen.getByLabelText(/Old Password/i), {
      target: { value: "oldpass" },
    });
    fireEvent.change(screen.getByLabelText(/^New Password$/i), {
      target: { value: "newpass" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm New Password/i), {
      target: { value: "different" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Update Password/i }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/New password and confirmation do not match/i);
  });

  test("shows error if password is too short", async () => {
    render(<Settings />);

    fireEvent.change(screen.getByLabelText(/Old Password/i), {
      target: { value: "oldpass" },
    });
    fireEvent.change(screen.getByLabelText(/^New Password$/i), {
      target: { value: "123" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm New Password/i), {
      target: { value: "123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Update Password/i }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/New password must be at least 6 characters/i);
  });

  test("updates password successfully", async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    render(<Settings />);

    fireEvent.change(screen.getByLabelText(/Old Password/i), {
      target: { value: "oldpass" },
    });
    fireEvent.change(screen.getByLabelText(/^New Password$/i), {
      target: { value: "newpass123" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm New Password/i), {
      target: { value: "newpass123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Update Password/i }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/Password updated successfully!/i);
  });

  test("handles password update error", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Failed to change password" }),
    });
    render(<Settings />);

    fireEvent.change(screen.getByLabelText(/Old Password/i), {
      target: { value: "oldpass" },
    });
    fireEvent.change(screen.getByLabelText(/^New Password$/i), {
      target: { value: "newpass123" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm New Password/i), {
      target: { value: "newpass123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Update Password/i }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/Failed to change password/i);
  });
});
