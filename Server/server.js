const express = require("express");
const cors = require("cors");
const db = require("./database.js");
const moment = require("moment");
require('dotenv').config();
// const ratelimit = require("express-rate-limit");

const app = express();
const PORT = process.env.PORT || 3000;

// const limiter = ratelimit({
//   windowMs: 1 * 60 * 1000, // 1 minute
//   max: 100, // Limit each IP to 100 requests per windowMs
//   message: "Terlalu banyak permintaan, coba lagi nanti.",
// });

// app.use(limiter);
app.use(cors({
  origin: 'https://rekam-medis-six.vercel.app/'
}));
app.use(express.json());

// app.on("connection", (socket) => {
//   console.log("🔌 New connection");
//   socket.on("close", () => {
//     console.log("❌ Connection closed");
//   });
// });

// app.use((req, res, next) => {
//   const start = Date.now();
//   res.on("finish", () => {
//     const duration = Date.now() - start;
//     console.log(`${req.method} ${req.originalUrl} - ${duration}ms`);
//   });
//   next();
// });
// const dns = require('dns');



// GET data pasien
app.get("/data", (req, res) => {
  const { search, tanggal } = req.query;
  let sqlQuery = "SELECT * FROM Pasien";
  let whereClause = [];
  
  // Filter berdasarkan nama
  if (search) {
    whereClause.push(`nama LIKE '%${search}%'`);
    console.log("Tanggal:", search);
  }
  
  // Filter berdasarkan tanggal
  if (tanggal) {
    whereClause.push(`DATE(tanggal) = '${tanggal}'`);
    
  }
  
  // Kalau tidak ada filter, tampilkan data hari ini saja
  if (!search && !tanggal) {
    const today = moment().format("YYYY-MM-DD");
    whereClause.push(`DATE(tanggal) = '${today}'`);
  }
  
  // Gabungkan semua kondisi
  if (whereClause.length > 0) {
    sqlQuery += ` WHERE ${whereClause.join(" AND ")}`;
  }
  
  sqlQuery += " ORDER BY tanggal DESC";
  
  db.query(sqlQuery, (err, rows) => {
    if (err) {
      console.error("Query gagal:", err);
      return res.status(500).json({ error: "Gagal ambil data" });
    }
    res.json(rows);
  });
});


app.get("/stats", (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', 0);
  const today = moment().format("YYYY-MM-DD");

  const totalQuery = "SELECT COUNT(*) AS total FROM Pasien";
  const todayQuery = `SELECT COUNT(*) AS hari_ini FROM Pasien WHERE DATE(tanggal) = '${today}'`;

  db.query(totalQuery, (err, totalResult) => {
    if (err) return res.status(500).json({ error: "Gagal ambil total pasien" });

    db.query(todayQuery, (err2, todayResult) => {
      if (err2) return res.status(500).json({ error: "Gagal ambil pasien hari ini" });

      res.json({
        total: totalResult[0].total,
        hari_ini: todayResult[0].hari_ini
      });
    });
  });
});

// POST data pasien
app.post("/data", (req, res) => {
  const { nama, tanggal, deskripsi } = req.body;
  const sqlQuery = `INSERT INTO Pasien (nama, tanggal, deskripsi) VALUES ('${nama}', '${tanggal}', '${deskripsi}')`;

  db.query(sqlQuery, (err) => {
    if (err) {
      console.error("Gagal menyimpan data:", err);
      return res.status(500).json({ error: "Gagal menyimpan data" });
    }
    res.status(201).json({ message: "Data berhasil disimpan" });
  });
});

// app.get('/resolve', (req, res) => {
//   const domain = req.query.domain;

//   if (!domain) {
//     return res.status(400).send("Missing domain");
//   }

//   dns.lookup(domain, (err, address, family) => {
//     if (err) {
//       // console.error("Failed to resolve:", domain);
//       return res.status(500).send("DNS resolution failed");
//     }
//     res.send(`Resolved IP for ${domain}: ${address}`);
//   });
// });

// app.post("/data", (req, res) => {
//   console.log("Simulasi POST diterima:", req.body);
//   res.status(200).json({ message: "Simulasi OK (tidak disimpan)" });
// });

// DELETE data pasien
app.delete("/data/delete/:id", (req, res) => {
  const id = req.params.id;
  const sqlQuery = `DELETE FROM Pasien WHERE id = ${id}`;

  db.query(sqlQuery, (err) => {
    if (err) {
      console.error("Gagal menghapus data:", err);
      return res.status(500).json({ error: "Gagal menghapus data" });
    }
    res.status(200).json({ message: "Data berhasil dihapus" });
  });
});

app.put("/data/edit/:id", (req, res) => {
  const id = req.params.id;
  const { nama, tanggal, deskripsi } = req.body;
  const sqlQuery = `UPDATE Pasien SET nama = '${nama}', tanggal = '${tanggal}', deskripsi = '${deskripsi}' WHERE id = ${id}`;

  db.query(sqlQuery, (err) => {
    if (err) {
      console.error("Gagal memperbarui data:", err);
      return res.status(500).json({ error: "Gagal memperbarui data" });
    }
    res.status(200).json({ message: "Data berhasil diperbarui" });
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
