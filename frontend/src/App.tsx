import { useEffect, useMemo, useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
} from "@mui/material";
import type { Product } from "./api/types";
import api from "./api/client";

type Mode = "add" | "edit";

const emptyProduct: Product = {
  id: 0,
  name: "",
  brand: "",
  price: 0,
  description: "",
  stock: 0,
};

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<Mode>("add");
  const [currentProduct, setCurrentProduct] = useState<Product>(emptyProduct);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const res = await api.get<Product[]>("/products");
    setProducts(res.data);
  };

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return products;
    const s = search.toLowerCase();
    return products.filter((p) =>
      [p.id.toString(), p.name, p.brand, p.description, p.price.toString(), p.stock.toString()]
        .join(" ")
        .toLowerCase()
        .includes(s)
    );
  }, [products, search]);

  const openAddDialog = () => {
    setDialogMode("add");
    setCurrentProduct(emptyProduct);
    setDialogOpen(true);
  };

  const openEditDialog = (p: Product) => {
    setDialogMode("edit");
    setCurrentProduct(p);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleInputChange = (field: keyof Product, value: string) => {
    setCurrentProduct((prev) => ({
      ...prev,
      [field]: field === "id" || field === "price" || field === "stock" ? Number(value) : value,
    }));
  };

  const validateProduct = (): string | null => {
    const { id, name, brand, description, price, stock } = currentProduct;
    if (!id || !name || !brand || !description || price <= 0 || stock < 0) {
      return "All fields are required. Price must be > 0 and stock ≥ 0.";
    }

    // Unique ID validation on client side
    const idTaken = products.some((p) => p.id === id && p.id !== (dialogMode === "edit" ? currentProduct.id : undefined));
    if (dialogMode === "add" && idTaken) return "Product ID must be unique.";

    return null;
  };

  const handleSave = async () => {
    const error = validateProduct();
    if (error) {
      setSnackbar({ open: true, message: error, severity: "error" });
      return;
    }

    try {
      if (dialogMode === "add") {
        await api.post("/products", currentProduct);
        setSnackbar({ open: true, message: "Product added successfully", severity: "success" });
      } else {
        await api.put(`/products/${currentProduct.id}`, currentProduct);
        setSnackbar({ open: true, message: "Product updated successfully", severity: "success" });
      }
      await loadProducts();
      setDialogOpen(false);
    } catch (e: any) {
      const message = e?.response?.data ?? "Error saving product";
      setSnackbar({ open: true, message, severity: "error" });
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/products/${deleteTarget.id}`);
      setSnackbar({ open: true, message: "Product deleted", severity: "success" });
      await loadProducts();
    } catch {
      setSnackbar({ open: true, message: "Error deleting product", severity: "error" });
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Product Management
      </Typography>

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <TextField
          label="Search products"
          variant="outlined"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ width: "60%" }}
        />
        <Button variant="contained" onClick={openAddDialog}>
          Add Product
        </Button>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Brand</TableCell>
            <TableCell>Price</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Stock</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredProducts.map((p) => (
            <TableRow key={p.id}>
              <TableCell>{p.id}</TableCell>
              <TableCell>{p.name}</TableCell>
              <TableCell>{p.brand}</TableCell>
              <TableCell>{p.price}</TableCell>
              <TableCell>{p.description}</TableCell>
              <TableCell>{p.stock}</TableCell>
              <TableCell align="right">
                <Button size="small" onClick={() => openEditDialog(p)}>
                  Edit
                </Button>
                <Button size="small" color="error" onClick={() => setDeleteTarget(p)}>
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {filteredProducts.length === 0 && (
            <TableRow>
              <TableCell colSpan={7}>No products found.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>{dialogMode === "add" ? "Add Product" : "Edit Product"}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="ID"
            type="number"
            value={currentProduct.id || ""}
            onChange={(e) => handleInputChange("id", e.target.value)}
          />
          <TextField
            label="Name"
            value={currentProduct.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
          />
          <TextField
            label="Brand"
            value={currentProduct.brand}
            onChange={(e) => handleInputChange("brand", e.target.value)}
          />
          <TextField
            label="Price"
            type="number"
            value={currentProduct.price || ""}
            onChange={(e) => handleInputChange("price", e.target.value)}
          />
          <TextField
            label="Description"
            value={currentProduct.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
          />
          <TextField
            label="Stock"
            type="number"
            value={currentProduct.stock || ""}
            onChange={(e) => handleInputChange("stock", e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Confirm delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete product{" "}
          <strong>{deleteTarget?.name}</strong>?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={confirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default App;
