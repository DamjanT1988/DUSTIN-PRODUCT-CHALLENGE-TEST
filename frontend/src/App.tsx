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
  Paper,
  Box,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Search, Edit, Delete } from "@mui/icons-material";
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
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
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
      [
        p.id.toString(),
        p.name,
        p.brand,
        p.description,
        p.price.toString(),
        p.stock.toString(),
      ]
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
      [field]:
        field === "id" || field === "price" || field === "stock"
          ? Number(value)
          : value,
    }));
  };

  const validateProduct = (): string | null => {
    const { id, name, brand, description, price, stock } = currentProduct;
    if (!id || !name || !brand || !description || price <= 0 || stock < 0) {
      return "All fields are required. Price must be > 0 and stock ≥ 0.";
    }

    const idTaken = products.some(
      (p) =>
        p.id === id &&
        (dialogMode === "add" ? true : p.id !== currentProduct.id)
    );
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
        setSnackbar({
          open: true,
          message: "Product added successfully",
          severity: "success",
        });
      } else {
        await api.put(`/products/${currentProduct.id}`, currentProduct);
        setSnackbar({
          open: true,
          message: "Product updated successfully",
          severity: "success",
        });
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
      setSnackbar({
        open: true,
        message: "Product deleted",
        severity: "success",
      });
      await loadProducts();
    } catch {
      setSnackbar({
        open: true,
        message: "Error deleting product",
        severity: "error",
      });
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      {/* Top bar: search (left) + add button (right) */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 2,
          borderBottom: "1px solid #ccc",
          pb: 1,
        }}
      >
        <TextField
          size="small"
          variant="standard"
          placeholder="Search Products"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ flexGrow: 1, mr: 2 }}
        />
        <Button
          variant="text"
          onClick={openAddDialog}
          sx={{ textTransform: "none", fontWeight: 500 }}
        >
          Add Product
        </Button>
      </Box>

      {/* Table container styled like the mock */}
      <Paper
        variant="outlined"
        sx={{
          width: "100%",
          overflowX: "auto",
          borderRadius: 0,
        }}
      >
        <Table
          size="small"
          sx={{
            "& th": {
              backgroundColor: "#e5e5e5",
              fontWeight: 500,
              fontSize: "0.8rem",
              borderRight: "1px solid #d0d0d0",
              whiteSpace: "nowrap",
            },
            "& td": {
              fontSize: "0.8rem",
              borderRight: "1px solid #f0f0f0",
              borderBottom: "1px solid #f0f0f0",
            },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 120 }}>Product ID</TableCell>
              <TableCell>Product name</TableCell>
              <TableCell sx={{ width: 120 }}>Brand</TableCell>
              <TableCell sx={{ width: 120 }}>Price</TableCell>
              <TableCell sx={{ width: 80, textAlign: "center" }}>
                Stock
              </TableCell>
              <TableCell sx={{ width: 120 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProducts.map((p, index) => (
              <TableRow
                key={p.id}
                sx={{
                  backgroundColor:
                    index % 2 === 0 ? "#f5f5f5" : "transparent",
                }}
              >
                <TableCell>{p.id}</TableCell>
                <TableCell>{p.name}</TableCell>
                <TableCell>{p.brand}</TableCell>
                <TableCell>{`${p.price} EUR`}</TableCell>
                <TableCell sx={{ textAlign: "center" }}>{p.stock}</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    aria-label="edit"
                    onClick={() => openEditDialog(p)}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    aria-label="delete"
                    onClick={() => setDeleteTarget(p)}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {filteredProducts.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>No products found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} fullWidth maxWidth="sm">
        <DialogTitle>
          {dialogMode === "add" ? "Add Product" : "Edit Product"}
        </DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
        >
          <TextField
            label="Product ID"
            type="number"
            value={currentProduct.id || ""}
            disabled={dialogMode === "edit"}
            onChange={(e) => handleInputChange("id", e.target.value)}
            size="small"
          />
          <TextField
            label="Product name"
            value={currentProduct.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            size="small"
          />
          <TextField
            label="Brand"
            value={currentProduct.brand}
            onChange={(e) => handleInputChange("brand", e.target.value)}
            size="small"
          />
          <TextField
            label="Price (EUR)"
            type="number"
            value={currentProduct.price || ""}
            onChange={(e) => handleInputChange("price", e.target.value)}
            size="small"
          />
          <TextField
            label="Description"
            value={currentProduct.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            size="small"
            multiline
            minRows={2}
          />
          <TextField
            label="Stock"
            type="number"
            value={currentProduct.stock || ""}
            onChange={(e) => handleInputChange("stock", e.target.value)}
            size="small"
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
      <Dialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        maxWidth="xs"
        fullWidth
      >
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

      {/* Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
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
