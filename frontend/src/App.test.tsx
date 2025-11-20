import { describe, it, beforeEach, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Product } from "./api/types";

// ✅ Mock the axios API client first
vi.mock("./api/client", () => {
  return {
    default: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    },
  };
});

// ✅ Mock the MUI icons to avoid loading the huge icons package
vi.mock("@mui/icons-material", () => {
  return {
    Search: () => <span>search-icon</span>,
    Edit: () => <span>edit-icon</span>,
    Delete: () => <span>delete-icon</span>,
  };
});

// Now import after mocks
import api from "./api/client";
import App from "./App";

const mockedProducts: Product[] = [
  {
    id: 1,
    name: 'Laptop 15"',
    brand: "TechPro",
    price: 1299,
    description: "Powerful laptop",
    stock: 5,
  },
  {
    id: 2,
    name: "Wireless Mouse",
    brand: "LogiX",
    price: 39,
    description: "Ergonomic mouse",
    stock: 40,
  },
];

describe("App product table", () => {
  beforeEach(() => {
    (api as any).get.mockReset();
    (api as any).get.mockResolvedValue({ data: mockedProducts });
  });

  it("renders products returned from the API", async () => {
    render(<App />);

    expect(await screen.findByText(/Laptop 15/i)).toBeInTheDocument();
    expect(screen.getByText(/Wireless Mouse/i)).toBeInTheDocument();

    expect(screen.getByText("Product ID")).toBeInTheDocument();
    expect(screen.getByText("Product name")).toBeInTheDocument();
    expect(screen.getByText("Brand")).toBeInTheDocument();
  });

  it("filters products based on search input", async () => {
    const user = userEvent.setup();
    render(<App />);

    await screen.findByText(/Laptop 15/i);

    const searchInput = screen.getByPlaceholderText("Search Products");
    await user.type(searchInput, "mouse");

    await waitFor(() => {
      expect(screen.queryByText(/Laptop 15/i)).not.toBeInTheDocument();
      expect(screen.getByText(/Wireless Mouse/i)).toBeInTheDocument();
    });
  });
});
