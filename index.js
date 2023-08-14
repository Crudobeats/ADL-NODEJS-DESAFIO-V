const express = require("express");
const app = express();
const PORT = 3000;

// Importación consultas 
const { obtenerJoyas, filtrarJoyas, JoyasPorId } = require("./consultas");

// Middleware
app.use((req, res, next) => {
  console.log(`Se realizó una consulta a la ruta: ${req.method} ${req.path}`);
  next();
});

app.use(express.json());

const prepareHATEOAS = (joyas, req) => {
  const results = joyas.map((joya) => ({
    name: joya.nombre,
    href: `${req.protocol}://${req.get("host")}/joyas/${joya.id}`,
  }));
  const total = joyas.length;
  return { total, results };
};

app.get("/joyas", async (req, res, next) => {
  try {
    const joyas = await obtenerJoyas(req.query);
    const HATE = prepareHATEOAS(joyas, req);
    res.json(HATE);
  } catch (error) {
    next(error);
  }
});

app.get("/joyas/filtros", async (req, res, next) => {
  try {
    const joyas = await filtrarJoyas(req.query);
    const HATE = prepareHATEOAS(joyas, req);
    res.json(HATE);
  } catch (error) {
    next(error);
  }
});

app.get("/joyas/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const joya = await JoyasPorId(id);

    if(!joya) {
      return res.status(404).json({error: "Joya no encontrada"});
    }
    res.json(joya);
  } catch (error) {
    next(error);
  }
});

// Middleware Errores
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ error: "Ha ocurrido un error en el servidor" });
});

app.listen(PORT, () => {
  console.log(`Servidor en el puerto ${PORT}`);
});
