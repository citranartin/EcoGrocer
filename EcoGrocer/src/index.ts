import { v4 as uuidv4 } from "uuid";
import { StableBTreeMap } from "azle";
import express from "express";
import { time } from "azle";

/**
 * Kelas `OrganicProduct` mewakili produk organik yang dapat dipasarkan melalui aplikasi EcoGrocer.
 */
class OrganicProduct {
  id: string;
  name: string; // Nama produk (misalnya, "Bayam Organik")
  description: string; // Deskripsi produk
  pricePerUnit: number; // Harga per unit (misalnya, per kg atau per bungkus)
  imageUrl: string; // URL gambar produk
  stock: number; // Jumlah stok yang tersedia
  seller: string; // Nama penjual (petani lokal)
  createdAt: Date;
  updatedAt: Date | null;
}

const productStorage = StableBTreeMap<string, OrganicProduct>(0);

const app = express();
app.use(express.json());

/**
 * Endpoint untuk menambahkan produk baru ke marketplace.
 */
app.post("/products", (req, res) => {
  const product: OrganicProduct = {
    id: uuidv4(),
    createdAt: getCurrentDate(),
    updatedAt: null,
    ...req.body,
  };
  productStorage.insert(product.id, product);
  res.json(product);
});

/**
 * Endpoint untuk mendapatkan semua produk organik yang tersedia.
 */
app.get("/products", (req, res) => {
  res.json(productStorage.values());
});

/**
 * Endpoint untuk mendapatkan detail produk berdasarkan ID.
 */
app.get("/products/:id", (req, res) => {
  const productId = req.params.id;
  const productOpt = productStorage.get(productId);
  if (!productOpt) {
    res.status(404).send(`Produk dengan ID=${productId} tidak ditemukan`);
  } else {
    res.json(productOpt);
  }
});

/**
 * Endpoint untuk memperbarui informasi produk.
 */
app.put("/products/:id", (req, res) => {
  const productId = req.params.id;
  const productOpt = productStorage.get(productId);
  if (!productOpt) {
    res
      .status(400)
      .send(
        `Tidak dapat memperbarui produk dengan ID=${productId}. Produk tidak ditemukan.`
      );
  } else {
    const product = productOpt;

    const updatedProduct = {
      ...product,
      ...req.body,
      updatedAt: getCurrentDate(),
    };
    productStorage.insert(product.id, updatedProduct);
    res.json(updatedProduct);
  }
});

/**
 * Endpoint untuk menghapus produk dari marketplace.
 */
app.delete("/products/:id", (req, res) => {
  const productId = req.params.id;
  const deletedProduct = productStorage.remove(productId);
  if (!deletedProduct) {
    res
      .status(400)
      .send(
        `Tidak dapat menghapus produk dengan ID=${productId}. Produk tidak ditemukan.`
      );
  } else {
    res.json(deletedProduct);
  }
});

app.listen();

/**
 * Fungsi untuk mendapatkan tanggal saat ini dalam format ICP.
 */
function getCurrentDate() {
  const timestamp = new Number(time());
  return new Date(timestamp.valueOf() / 1000_000);
}
